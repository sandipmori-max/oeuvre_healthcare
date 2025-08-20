import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/no_data/NoData';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import { styles } from './entry_style';
import { ERP_ICON } from '../../../../assets';

const accentColors = ['#dbe0f5ff', '#c8f3edff', '#faf1e0ff', '#f0e1e1ff', '#f2e3f8ff', '#e0f3edff'];

const EntryTab = () => {
  const navigation = useNavigation<any>();

  const { menu, isMenuLoading } = useAppSelector(state => state.auth);
  const allList = menu?.filter(item => item?.isReport === false) ?? [];

  const [isHorizontal, setIsHorizontal] = useState(false);
  const [bookmarks, setBookmarks] = useState<{ [key: string]: boolean }>({});
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const list = showBookmarksOnly ? allList.filter(item => bookmarks[item.id]) : allList;

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
         
          <TouchableOpacity
            onPress={() => setIsHorizontal(prev => !prev)}
            style={{ marginRight: 12 }}
          >
            <Image
              source={isHorizontal ? ERP_ICON.GRID : ERP_ICON.LIST}
              resizeMode="contain"
              style={{ width: 30, height: 29, tintColor: 'white' }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowBookmarksOnly(prev => !prev)}
            style={{ marginRight: 12 }}
          >
            <Image
              source={showBookmarksOnly ? ERP_ICON.All : ERP_ICON.BOOK_MARK}
              style={{ width: 28, height: 30, tintColor: 'white' }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
           <TouchableOpacity onPress={() => {}} style={{ marginRight: 12 }}>
            <Image
              source={ERP_ICON.REFRESH}
              style={{ width: 28, height: 32, tintColor: 'white' }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
        </>
      ),
      headerLeft: () => (
        <>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 12 }}>
            <Image
              source={ERP_ICON.MENU}
              style={{ width: 28, height: 32, tintColor: 'white' }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation, showBookmarksOnly, isHorizontal]);

  const renderItem = ({ item, index }: any) => {
    const backgroundColor = accentColors[index % accentColors.length];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor, flexDirection: isHorizontal ? 'row' : 'column' }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Web', { item })}
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
            {item.title ? item.title.trim().slice(0, 2).toUpperCase() : '?'}
          </Text>
        </View>

        <View
          style={{
            marginLeft: isHorizontal ? 16 : 0,
            marginTop: isHorizontal ? 0 : 12,
            alignItems: isHorizontal ? 'flex-start' : 'center',
          }}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.name}</Text>
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

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 10,
  },
  button: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
