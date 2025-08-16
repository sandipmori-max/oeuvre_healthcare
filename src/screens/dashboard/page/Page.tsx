import { StyleSheet, Text, View, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { getERPPageThunk } from '../../../store/slices/auth/thunk';
import { formatHeaderTitle } from '../../../utils/helpers';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import NoData from '../../../components/no_data/NoData';
import { styles } from './page_style';

type PageRouteParams = { PageScreen: { item: any } };

const PageScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const [controls, setControls] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const route = useRoute<RouteProp<PageRouteParams, 'PageScreen'>>();
  const { item } = route.params;
  console.log('🚀 ~ PageScreen ~ item:', item);

  useLayoutEffect(() => {
    navigation.setOptions({ title: item?.title || 'Details' });
  }, [navigation, item?.title]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setError(null);
        setLoadingPageId(item.id);
        const raw = await dispatch(getERPPageThunk(item.name)).unwrap();
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const pageControls = Array.isArray(parsed?.pagectl) ? parsed.pagectl : [];
        setControls(pageControls);
      } catch (e: any) {
        console.log('Failed to load page:', e);
        setError(e?.message || 'Failed to load page');
      } finally {
        setLoadingPageId(null);
      }
    };

    fetchPageData();
  }, [item, route]);

  const allKeys = controls && controls.length > 0 ? Object.keys(controls[0]) : [];

  const TableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      {allKeys.map(key => (
        <Text
          key={key}
          style={[styles.tableHeaderCell, { minWidth: 100, maxWidth: 100 }]}
          numberOfLines={1}
        >
          {formatHeaderTitle(key)}
        </Text>
      ))}
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={styles.tableRow}>
        {allKeys.map(key => {
          let value = item[key];
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          } else if (value === null || value === undefined) {
            value = '';
          } else {
            value = String(value);
          }

          return (
            <Text
              key={key}
              style={[styles.tableCell, { minWidth: 100, maxWidth: 100 }]}
              numberOfLines={1}
            >
              {value}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!!error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {loadingPageId ? (
            <FullViewLoader />
          ) : (
            <>
              <ScrollView horizontal>
                <View
                  style={{
                    flexDirection: 'column',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: '#f8f9fa',
                      justifyContent: 'center',
                    }}
                  >
                    <TableHeader />
                  </View>
                  <View>
                    <FlatList
                      data={controls}
                      keyExtractor={(item, idx) => String(item?.id || idx)}
                      renderItem={renderItem}
                      contentContainerStyle={styles.listContent}
                      ListEmptyComponent={!loadingPageId ? <NoData /> : null}
                    />
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default PageScreen;
