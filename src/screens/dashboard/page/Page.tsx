import { StyleSheet, Text, View, FlatList, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { getERPPageThunk } from '../../../store/slices/auth/thunk';
import { formatHeaderTitle } from '../../../utils/helpers';
import FullViewLoader from '../../../components/FullViewLoader';
import NoData from '../../../components/NoData';

type PageRouteParams = { PageScreen: { item: any } };

const PageScreen = () => {
      const navigation = useNavigation()
      const dispatch = useAppDispatch();

      const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
      const [controls, setControls] = useState<any[]>([]);
      const [error, setError] = useState<string | null>(null);
    
      const route = useRoute<RouteProp<PageRouteParams, 'PageScreen'>>();
      const { item } = route.params;
      console.log("🚀 ~ PageScreen ~ item:", item)

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

        const allKeys = controls && controls.length > 0 
          ? Object.keys(controls[0]) 
          : [];

        const TableHeader = () => (
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {allKeys.map(key => (
              <Text
                key={key}
                style={[styles.tableHeaderCell,{ minWidth: 100, maxWidth: 100 }]}
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
       
      {loadingPageId && (
             <FullViewLoader />
      )}

      {!!error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
       <ScrollView horizontal>
       <FlatList
            data={controls}
            keyExtractor={(item, idx) => String(item?.id || idx)}
            renderItem={renderItem}
            ListHeaderComponent={controls.length ? TableHeader : null}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={!loadingPageId ? (
               <NoData />
            ) : null}
          />
        </ScrollView>
    </View>
  )
}

export default PageScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F8F9FA',
  },
    tableHeaderRow: {
    backgroundColor: '#eee',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    textAlign: 'center',
  },
  tableCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    textAlign: 'center'
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
  },
   tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
    marginBottom: 12,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignContent:'center',
    justifyContent:'center'
  },
  loadingText: {
    marginLeft: 8,
    color: '#6C757D',
  },
  errorText: {
    color: '#D9534F',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leadIconText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  tooltipText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6C757D',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chipMuted: {
    backgroundColor: '#F1F3F5',
  },
  chipMutedText: {
    color: '#868E96',
  },
  chipWarn: {
    backgroundColor: '#FFF4E6',
  },
  chipWarnText: {
    color: '#D9480F',
  },
  badge: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#D9534F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeRequired: {
    backgroundColor: '#FFE9EC',
  },
  badgeTextRequired: {
    color: '#C92A2A',
  },
  metaText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6C757D',
  },
})