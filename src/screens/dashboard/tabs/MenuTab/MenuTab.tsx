import { Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/no_data/NoData';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import ERPIcon from '../../../../components/icon/ERPIcon';
import { getERPMenuThunk } from '../../../../store/slices/auth/thunk';
import {
  createBookmarksTable,
  getBookmarks,
  getDBConnection,
  insertOrUpdateBookmark,
} from '../../../../utils/sqlite';
import ErrorMessage from '../../../../components/error/Error';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { DARK_COLOR, ERP_COLOR_CODE } from '../../../../utils/constants';
import Toast from '../../../../components/Toast/Toast';

import { StyleSheet } from 'react-native';
const accentColors = ['#dbe0f5ff', '#c8f3edff', '#faf1e0ff', '#f0e1e1ff', '#f2e3f8ff', '#e0f3edff'];

const MenuTab = ({ type, headerText, searchPlaceholder }: any) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { menu, error, isMenuLoading, isAuthenticated, activeToken, user } = useAppSelector(
    state => state.auth
  );
  const theme = useAppSelector(state => state.theme.mode);

  const allList = menu?.filter(item => item?.isReport === type) ?? [];
  const [entryLoader, setEntryLoader] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState(allList);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const searchTimeout = useRef(null);
  const list = showBookmarksOnly ? filteredList.filter(i => bookmarks[i.id]) : filteredList;

  const showToast = msg => setToast({ visible: true, message: msg });
  const hideToast = () => setToast(t => ({ ...t, visible: false }));

  function getInitials(name) {
  if (!name) return '';

  const words = name.trim().split(/\s+/);

  const result =
    words.length === 1
      ? words[0].slice(0, 2)
      : words.slice(0, 2).map(w => w[0]).join('');

  return result.toUpperCase();
}


  // Load bookmarks
  useEffect(() => {
    (async () => {
      const db = await getDBConnection();
      await createBookmarksTable(db);
      const saved = await getBookmarks(db, user?.id);
      setBookmarks(saved);
    })();
  }, []);

  // Toggle bookmark
  const toggleBookmark = async id => {
    const updated = !bookmarks[id];
    setBookmarks(prev => ({ ...prev, [id]: updated }));

    const db = await getDBConnection();
    await insertOrUpdateBookmark(db, id, user?.id, updated);

    showToast('Bookmark Updated!');
  };

  // Search effect
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const filtered = allList.filter(
        item =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredList(filtered);
    }, 300);
  }, [searchText, allList]);

  // Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_APP_COLOR,
         borderBottomWidth: 1,
        borderBottomColor: '#fff',
      },
      headerTintColor: 'white',
      headerTitle: () =>
        showSearch ? (
          <View style={{ width: Dimensions.get('screen').width - 70, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={searchPlaceholder}
              autoFocus={true}
              style={{
                flex: 1,
                backgroundColor: '#f0f0f0',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 36,
              }}
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchText(''); }}>
              <MaterialIcons name="clear" size={24} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>{headerText}</Text>
        ),
      headerRight: () =>
        !showSearch && (
          <>
            {allList.length > 5 && <ERPIcon name="search" onPress={() => setShowSearch(true)} />}
            <ERPIcon name="refresh" onPress={() => setIsRefresh(!isRefresh)} />
            <ERPIcon name={isHorizontal ? 'dashboard' : 'list'} onPress={() => setIsHorizontal(p => !p)} />
            <ERPIcon name={!showBookmarksOnly ? 'bookmark-outline' : 'bookmark'} onPress={() => setShowBookmarksOnly(p => !p)} />
          </>
        ),
      headerLeft: () => (
        <ERPIcon extSize={24} isMenu name="menu" onPress={() => navigation.openDrawer()} />
      ),
    });
  }, [showSearch, showBookmarksOnly, isHorizontal, searchText, allList]);

  useFocusEffect(
    useCallback(() => {
      setIsHorizontal(false)
      setShowSearch(false);
      setIsRefresh(false);
      setShowBookmarksOnly(false)
      return () => {};
    }, [])
  );

  // Menu loading
  useEffect(() => {
    if (isAuthenticated) {
      setEntryLoader(true);
      dispatch(getERPMenuThunk())
        .unwrap()
        .finally(() => setEntryLoader(false));
    }
  }, [isAuthenticated, activeToken, isRefresh]);

  const renderItem = ({ item, index }: any) => {
    const backgroundColor = accentColors[index % accentColors.length];

    return (
      <TouchableOpacity
        style={[
          styles.card,
          theme === 'dark' && { borderColor: 'white', borderWidth: 1 },
          {
            backgroundColor: theme === 'dark' ? 'black' : backgroundColor,
            flexDirection: isHorizontal ? 'row' : 'column',
          },
        ]}
        onPress={() =>
          item.url.includes('.') ? navigation.navigate('Web', { item }) : navigation.navigate('List', { item })
        }
      >
        <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={{ position: 'absolute', top: 0, right: 0 }}>
          <MaterialIcons 
          color={theme === 'dark' ? 'white' : 'black'}
          name={bookmarks[item.id] ? 'bookmark' : 'bookmark-outline'} size={24} />
        </TouchableOpacity>

        <View 
          style={[
            styles.iconContainer,
            theme === 'dark' && { borderColor: 'white' },
            { backgroundColor: theme === 'dark' ? DARK_COLOR : ERP_COLOR_CODE.ERP_WHITE },
          ]}
        >
          <Text style={[styles.iconText, 
            
            theme === 'dark' && { color: 'white' }]}>
            {item.icon ||
              getInitials(item?.name)
            }
          </Text>
        </View>

        <View style={{ marginLeft: isHorizontal ? 16 : 0, marginTop: isHorizontal ? 0 : 12 }}>
          <Text numberOfLines={2} style={[styles.title, 
            {
              maxWidth: isHorizontal ? '95%' : 'auto',
              textAlign: isHorizontal ? 'left' : 'center'
            },
            theme === 'dark' && { color: 'white' }]}>
            {item.name}
          </Text>
          <Text numberOfLines={2} style={[styles.subtitle, theme === 'dark' && { color: 'white' },
          !isHorizontal && {
            textAlign:'center'
          }
          ]}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isMenuLoading) return <FullViewLoader />;
  if (error) return <ErrorMessage message={error} />;
  if (list.length === 0) return <NoData />;

  return (
    <View style={{ flex: 1, backgroundColor: theme === 'dark' ? 'black' : 'white' }}>
      <FlatList
        key={`${isHorizontal}-${showBookmarksOnly}-${searchText}`}
        data={list}
        renderItem={renderItem}
        numColumns={isHorizontal ? 1 : 2}
        columnWrapperStyle={!isHorizontal ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <Toast visible={toast.visible} message={toast.message} onHide={hideToast} />
    </View>
  );
};

export default MenuTab;

export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 104, 104, 0.3)',
  },
  iconText: {
    opacity: 0.5,
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(75, 73, 73, 0.85)',
  },
});
