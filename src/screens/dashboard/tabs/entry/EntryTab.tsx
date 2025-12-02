import { Dimensions, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/no_data/NoData';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import ERPIcon from '../../../../components/icon/ERPIcon';
import { getERPMenuThunk } from '../../../../store/slices/auth/thunk';
import { styles } from '../entry/entry_style';
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
import useTranslations from '../../../../hooks/useTranslations';

const accentColors = ['#dbe0f5ff', '#c8f3edff', '#faf1e0ff', '#f0e1e1ff', '#f2e3f8ff', '#e0f3edff'];

const EntryTab = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslations();

  const dispatch = useAppDispatch();
  const { error, isAuthenticated, activeToken } = useAppSelector(state => state.auth);
  const { menu, isMenuLoading } = useAppSelector(state => state.auth);
  const { user } = useAppSelector(state => state?.auth);
  const theme = useAppSelector(state => state?.theme.mode);
  const [entryLoader, setEntryLoader] = useState(false);

  const allList = menu?.filter(item => item?.isReport === 'E') ?? [];
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [bookmarks, setBookmarks] = useState<{ [key: string]: boolean }>({});
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState(allList);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, message: msg });
  }, []);

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const list = showBookmarksOnly ? filteredList.filter(item => bookmarks[item.id]) : filteredList;

  useEffect(() => {
    (async () => {
      const db = await getDBConnection();
      await createBookmarksTable(db);
      const saved = await getBookmarks(db, user?.id);
      setBookmarks(saved);
    })();
  }, []);

  const toggleBookmark = async (id: string) => {
    const updated = !bookmarks[id];
    setBookmarks(prev => ({ ...prev, [id]: updated }));
    const db = await getDBConnection();
    await insertOrUpdateBookmark(db, id, user?.id, updated);
    showToast(t('text.text47'))

  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const filtered = allList.filter(
        item =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.title.toLowerCase().includes(searchText.toLowerCase()),
      );
      setFilteredList(filtered);
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchText, allList]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_APP_COLOR,   // <-- BLACK HEADER
      },
      headerTintColor: '#fff',
      headerTitle: () =>
        showSearch ? (
          <View
            style={{
              width: Dimensions.get('screen').width - 70,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("text.text49")}
              style={{
                flex: 1,
                backgroundColor: '#f0f0f0',
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 36,
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setShowSearch(false);
                setSearchText('');
              }}
            >
              <MaterialIcons
                name="clear"
                size={24}
                color={ERP_COLOR_CODE.ERP_WHITE}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: theme === 'dark' ? 'white' : ERP_COLOR_CODE.ERP_WHITE, fontSize: 18, fontWeight: '600' }}>
            {t("text.text50")}
          </Text>
        ),
      headerRight: () => (
        <>

          {allList.length > 5 && !showSearch && (
            <ERPIcon name="search" onPress={() => setShowSearch(true)} />
          )}
          {!showSearch && (
            <>
              <ERPIcon name="refresh" onPress={() => setIsRefresh(!isRefresh)} />

              <ERPIcon
                name={isHorizontal ? 'dashboard' : 'list'}
                onPress={() => setIsHorizontal(prev => !prev)}
              />
              <ERPIcon
                name={!showBookmarksOnly ? 'bookmark-outline' : 'bookmark'}
                onPress={() => setShowBookmarksOnly(prev => !prev)}
              />

            </>
          )}
        </>
      ),
      headerLeft: () => (
        <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation.openDrawer()} />
      ),
    });
  }, [navigation, showBookmarksOnly, isHorizontal, isRefresh, showSearch, searchText, allList]);

  useEffect(() => {
    if (isAuthenticated) {
      setEntryLoader(true);

      dispatch(getERPMenuThunk())
        .unwrap()
        .then(() => {
          setEntryLoader(false);
        })
        .catch(() => {
          setEntryLoader(false);
        });
    }
  }, [isAuthenticated, dispatch, activeToken, isRefresh]);

  const renderItem = ({ item, index }: any) => {
    const backgroundColor = accentColors[index % accentColors.length];

    return (
      <TouchableOpacity
        style={[styles.card,
        theme === 'dark' && {
          borderColor: 'white',
          borderWidth: 1,

        },
        { backgroundColor: theme === 'dark' ? 'black' : backgroundColor, flexDirection: isHorizontal ? 'row' : 'column' }]}
        activeOpacity={0.7}
        onPress={() => {
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
          <MaterialIcons
            size={24}
            name={bookmarks[item?.id] ? 'bookmark' : 'bookmark-outline'}
            color={ERP_COLOR_CODE.ERP_BLACK}
          />
        </TouchableOpacity>

        <View style={[styles.iconContainer,
        theme === 'dark' && {
          borderColor: 'white'
        },
        { backgroundColor: theme === 'dark' ? DARK_COLOR : ERP_COLOR_CODE.ERP_WHITE }]}>
          <Text style={[styles.iconText, theme === 'dark' && {
            color: 'white'
          }]}>
            {item?.icon && item?.icon !== ''
              ? item.icon
              : item?.name
                ? (() => {
                  const words = item.name.trim().split(' ').filter(Boolean);
                  if (words.length === 1) {
                    return words[0].substring(0, 2).toUpperCase();
                  } else {
                    return words
                      .slice(0, 2)
                      .map(word => word[0].toUpperCase())
                      .join('');
                  }
                })()
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
          <Text numberOfLines={2} style={[styles.title, theme === 'dark' ? {
            color: 'white'
          } : {
            color: 'black'
          },]}>
            {item?.name}
          </Text>
          <Text numberOfLines={2} style={[styles.subtitle, theme === 'dark' && {
            color: 'white'
          },]}>
            {item?.title}
          </Text>
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

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}
      >
        <ErrorMessage message={error} />
      </View>
    );
  }
  if (showBookmarksOnly && list?.length === 0 || allList?.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        <NoData />
      </View>
    );
  }
  if (!error && !entryLoader && menu?.length === 0 && filteredList?.length === 0 && list?.length === 0 && allList?.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        <NoData />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_WHITE }}>
      <FlatList
        key={`${isHorizontal}-${showBookmarksOnly}-${searchText}`}
        keyboardShouldPersistTaps="handled"
        data={list}
        keyExtractor={(item, index) => index.toString()}
        numColumns={isHorizontal ? 1 : 2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={!isHorizontal ? styles.columnWrapper : undefined}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <Toast visible={toast.visible} message={toast.message} onHide={hideToast} />
    </View>
  );
};

export default EntryTab;
