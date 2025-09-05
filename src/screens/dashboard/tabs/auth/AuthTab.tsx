import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/no_data/NoData';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import { ERP_ICON } from '../../../../assets';
import ERPIcon from '../../../../components/icon/ERPIcon';
import { getERPDashboardThunk, getERPMenuThunk } from '../../../../store/slices/auth/thunk';
import { styles } from '../entry/entry_style';
import { createBookmarksTable, getBookmarks, getDBConnection, insertOrUpdateBookmark } from '../../../../utils/sqlite';

const accentColors = ['#dbe0f5ff', '#c8f3edff', '#faf1e0ff', '#f0e1e1ff', '#f2e3f8ff', '#e0f3edff'];

const EntryTab = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, activeToken } = useAppSelector(state => state.auth);
  const { menu, isMenuLoading } = useAppSelector(state => state.auth);
  const allList = menu?.filter(item => item?.isReport === 'A') ?? [];
  console.log('🚀 ~ EntryTab ~ allList:', allList);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);

  const [isHorizontal, setIsHorizontal] = useState(false);
  const [bookmarks, setBookmarks] = useState<{ [key: string]: boolean }>({});
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const list = showBookmarksOnly ? allList.filter(item => bookmarks[item.id]) : allList;

  useEffect(() => {
     (async () => {
       const db = await getDBConnection();
       await createBookmarksTable(db);
       const saved = await getBookmarks(db);
       setBookmarks(saved);
     })();
   }, []);
 
   const toggleBookmark = async (id: string) => {
     const updated = !bookmarks[id];
     setBookmarks(prev => ({ ...prev, [id]: updated }));
 
     const db = await getDBConnection();
     await insertOrUpdateBookmark(db, id, updated);
   };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon
            name={!isHorizontal ? 'list' : 'apps'}
            onPress={() => setIsHorizontal(prev => !prev)}
          />

          <ERPIcon
            name={showBookmarksOnly ? 'star' : 'allout'}
            onPress={() => setShowBookmarksOnly(prev => !prev)}
          />

          <ERPIcon
            name="refresh"
            onPress={() => {
              setIsRefresh(!isRefresh);
            }}
          />
        </>
      ),
      headerLeft: () => (
        <>
          <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation.openDrawer()} />
        </>
      ),
    });
  }, [navigation, showBookmarksOnly, isHorizontal, isRefresh]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getERPMenuThunk());
    }
  }, [isAuthenticated, dispatch, activeToken, isRefresh]);
  const renderItem = ({ item, index }: any) => {
    const backgroundColor = accentColors[index % accentColors.length];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor, flexDirection: isHorizontal ? 'row' : 'column' }]}
        activeOpacity={0.7}
        onPress={() => {
          console.log('🚀 ~ renderItem ~ backgroundColor:', item?.url);

          if (item?.url.includes('.') || item?.url.includes('?') || item?.url.includes('/')) {
            navigation.navigate('Web', { item });
          } else {
            navigation.navigate('List', { item });
          }
        }}
      >
        <TouchableOpacity
          onPress={() => toggleBookmark(item.id)}
          style={{ position: 'absolute', top: 0, right: 0, zIndex: 1 }}
        >
          <Image
            source={bookmarks[item.id] ? ERP_ICON.BOOK_MARK_DONE : ERP_ICON.BOOK_MARK}
            style={styles.icon}
          />
        </TouchableOpacity>

        <View style={[styles.iconContainer, { backgroundColor: 'rgba(243, 239, 239, 0.42)' }]}>
          <Text style={styles.iconText}>
            {item?.icon !== ''
              ? item?.icon
              : item.name
              ? item.name
                  .trim()
                  .split(' ')  
                  .slice(0, 2)  
                  .map(word => word[0].toUpperCase()) 
                  .join('')
              : '?'}
          </Text>
        </View>

        <View
          style={{
            marginLeft: isHorizontal ? 16 : 0,
            marginTop: isHorizontal ? 0 : 12,
            alignItems: isHorizontal ? 'flex-start' : 'center',
          }}
        >
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isMenuLoading) {
    return (
      <View style={styles.centered}>
        <FullViewLoader />
      </View>
    );
  }

  return (
    <>
      <FlatList
        key={`${isHorizontal}-${showBookmarksOnly}`}
        data={list}
        keyExtractor={item => item?.id}
        numColumns={isHorizontal ? 1 : 2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={!isHorizontal ? styles.columnWrapper : undefined}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => {
          return (
            <View
              style={{
                height: Dimensions.get('window').height * 0.6,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <NoData />
            </View>
          );
        }}
      />
    </>
  );
};

export default EntryTab;
