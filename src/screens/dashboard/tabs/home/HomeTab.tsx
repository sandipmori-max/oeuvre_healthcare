import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { styles } from './home_style';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import NoData from '../../../../components/no_data/NoData';
import ERPIcon from '../../../../components/icon/ERPIcon';
import { getERPDashboardThunk } from '../../../../store/slices/auth/thunk';
import ErrorMessage from '../../../../components/error/Error';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import Footer from './Footer';
import PieChartSection from './chartData';
const { width } = Dimensions.get('screen');

const hasHtmlContent = (str: string) => {
  if (!str || typeof str !== 'string') return false;
  return /<([a-z]+)([^>]*?)>/i.test(str);
};

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const { dashboard, isDashboardLoading, isAuthenticated, error, user } = useAppSelector(
    state => state.auth,
  );
  console.log('🚀 ~ HomeScreen ~ dashboard:', dashboard);
  const [loadingPageId, setLoadingPageId] = useState<any>(null);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);

  const theme = useAppSelector(state => state?.theme);
  const [actionLoader, setActionLoader] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredDashboard, setFilteredDashboard] = useState(dashboard);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const translateX = useRef(new Animated.Value(width)).current;

  const htmlItems = filteredDashboard.filter(item => hasHtmlContent(item.data));
  const emptyItems = filteredDashboard.filter(item => item?.data === '');

  const textItems = filteredDashboard.filter(item => item.data && !hasHtmlContent(item.data));

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const filtered = dashboard.filter(item =>
        (item.name || '').toLowerCase().includes(searchText.toLowerCase()),
      );
      console.log('🚀 ~ HomeScreen ~ filtered-------:', filtered);
      setFilteredDashboard(filtered);
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchText, dashboard]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -350,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () =>
        showSearch ? (
          <View style={{ width: width - 70, flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search dashboard here..."
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
          <Text style={{ color: ERP_COLOR_CODE.ERP_WHITE, fontSize: 18, fontWeight: '600' }}>
            Home
          </Text>
        ),
      headerRight: () => (
        <>
          {!showSearch && (
            <>
              {dashboard.length > 5 && (
                <ERPIcon name="search" onPress={() => setShowSearch(true)} />
              )}
              <ERPIcon
                name={!isHorizontal ? 'list' : 'apps'}
                onPress={() => setIsHorizontal(prev => !prev)}
              />
              <ERPIcon
                name="refresh"
                onPress={() => {
                  setActionLoader(true);
                  setIsRefresh(!isRefresh);
                  dispatch(getERPDashboardThunk());
                  setTimeout(() => {
                    setActionLoader(false);
                  }, 100);
                }}
                isLoading={actionLoader}
              />
            </>
          )}
        </>
      ),
      headerLeft: () => (
        <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation?.openDrawer()} />
      ),
    });
  }, [navigation, isHorizontal, isRefresh, showSearch, dashboard, searchText, filteredDashboard]);

  useFocusEffect(
    useCallback(() => {
      setLoadingPageId(true);

      if (isAuthenticated) {
        dispatch(getERPDashboardThunk());
      }

      return () => {};
    }, [isAuthenticated, dispatch]),
  );

  const getInitials = (text?: string) => {
    if (!text) return '?';
    const trimmed = text?.trim();
    if (trimmed?.length === 0) return '?';
    return trimmed.slice(0, 2).toUpperCase();
  };

  const accentColors = ['#4C6FFF', '#00C2A8', '#FFB020', '#FF6B6B', '#9B59B6', '#20C997'];

  const pieChartData = filteredDashboard
    .filter(item => {
      const num = Number(item?.data);
      return item?.title !== 'Attendance Code' && item?.data !== '' && !isNaN(num) && num > 0;
    })
    .map((item, index) => ({
      value: Number(item?.data),
      color: accentColors[index % accentColors.length],
      text: item?.title,
    }));

  const renderDashboardItem = ({ item, index, isFromHtml, isFromMenu }: any) => {
    return (
      <TouchableOpacity
        key={item?.id || index}
        style={[
          styles.dashboardItem,
          {
            paddingLeft: 4,
            marginHorizontal: 4,
            borderRadius: 8,
            width: isFromHtml ? '100%' : isHorizontal ? '100%' : '48%',
            flex: 1,
            borderLeftColor: accentColors[index % accentColors.length],
            borderWidth: 1,
            borderLeftWidth: 3,
          },
        ]}
        activeOpacity={0.7}
        onPress={async () => {
          if (item?.url.includes('.') || item?.url.includes('?') || item?.url.includes('/')) {
            navigation.navigate('Web', { item });
          } else {
            navigation.navigate('List', { item });
          }
        }}
      >
        <View
          style={{
            backgroundColor: theme === 'dark' ? ERP_COLOR_CODE.ERP_333 : ERP_COLOR_CODE.ERP_WHITE,
            borderRadius: 8,
          }}
        >
          <View style={styles.dashboardItemContent}>
            <View style={styles.dashboardItemHeader}>
              <View style={styles.dashboardItemTopRow}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: accentColors[index % accentColors.length] },
                  ]}
                >
                  <MaterialIcons name={item?.image || 'widgets'} color={ERP_COLOR_CODE.ERP_WHITE} size={22} />
                  {/* <Text style={styles.iconText}>{getInitials(item?.name)}</Text> */}
                </View>
                <View style={styles.headerTextWrap}>
                  <Text
                    style={[
                      styles.dashboardItemText,
                      {
                        color:
                          theme === 'dark' ? ERP_COLOR_CODE.ERP_WHITE : ERP_COLOR_CODE.ERP_BLACK,
                        flexShrink: 1,
                        includeFontPadding: false,
                        textAlignVertical: 'top',
                      },
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {isFromMenu
                      ? item?.title
                      : !isHorizontal
                      ? item?.title.replace(' ', '\n')
                      : item?.title}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ marginVertical: item.data ? 4 : 0 }}>
              {loadingPageId === (item.id || String(index)) && (
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={ERP_COLOR_CODE.ERP_007AFF} />
                  <Text style={{ marginLeft: 8, color: ERP_COLOR_CODE.ERP_6C757D }}>
                    Loading page...
                  </Text>
                </View>
              )}
              {item.data ? (
                <View style={styles.dataContainer}>
                  <Footer
                    textColor={accentColors[index % accentColors.length]}
                    isFromMenu={isFromMenu}
                    isHorizontal={isHorizontal}
                    footer={item?.data}
                    index={index}
                    accentColors={accentColors}
                     isFromListPage={undefined}                  />
                </View>
              ) : (
                <View style={styles.dataContainer}>
                  <Text style={styles.dashboardItemData} numberOfLines={2}>
                    {'-'}
                  </Text>
                </View>
              )}
            </View>
            {item?.footer ? (
              <View style={{ marginTop: 4 }}>
                <Footer
                  textColor={accentColors[index % accentColors.length]}
                  isFromMenu={isFromMenu}
                  isHorizontal={isHorizontal}
                  footer={item?.footer}
                  index={index}
                  accentColors={accentColors}
                   isFromListPage={undefined}                />
              </View>
            ) : (
              <Text
                style={{
                  color: accentColors[index % accentColors.length],
                }}
              >
                {'-'}
              </Text>
            )}
            {item?.footer || item.data ? (
              <> </>
            ) : (
              <View style={{ height: 12, width: 12, backgroundColor: '' }}></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
 
  const scrollY = useRef(new Animated.Value(0)).current;
 

  return (
    <View style={theme === 'dark' ? styles.containerDark : styles.container}>
      <View
        style={{
          marginTop: 1,
          backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
          padding: 12,
          // width: width,
          borderBottomRightRadius: 24,
          borderBottomLeftRadius: 24,
        }}
      >
        <Animated.View
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            gap: 8,
            flexDirection: 'row',
            // transform: [{ translateX }],
          }}
        >
          <MaterialIcons name="business" size={24} color={ERP_COLOR_CODE.ERP_WHITE} />
          <Text
            numberOfLines={1}
            style={{
              color: ERP_COLOR_CODE.ERP_WHITE,
              fontWeight: '600',
              fontSize: 16,
              maxWidth: 280,
            }}
          >
            {user?.companyName || ''}
          </Text>
        </Animated.View>
      </View>

      {isDashboardLoading ? (
        <FullViewLoader />
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <ErrorMessage message={error} />{' '}
        </View>
      ) : filteredDashboard?.length === 0 && !isDashboardLoading ? (
        <NoData />
      ) : (
        <>
          <Animated.FlatList
            showsVerticalScrollIndicator={false}
            data={['']}
            keyExtractor={(_, i) => i.toString()}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: true,
            })}
            scrollEventThrottle={16}
            renderItem={() => (
              <>
                {/* Pie chart section */}
                {pieChartData.length > 0 && (
                  <PieChartSection pieChartData={pieChartData} navigation={navigation} t={t} />
                )}
                {pieChartData.length === 0 && <View style={{ marginTop: 12 }} />}
                {/* Dashboard items */}
                <View style={styles.dashboardSection}>
                  <FlatList
                    key={`${isHorizontal}`}
                    keyboardShouldPersistTaps="handled"
                    data={[...textItems, ...emptyItems]}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={isHorizontal ? 1 : 2}
                    columnWrapperStyle={!isHorizontal ? styles.columnWrapper : undefined}
                    renderItem={
                      ({ item, index }) =>
                        renderDashboardItem({ item, index, isFromHtml: false, isFromMenu: false }) // 👈 custom prop passed here
                    }
                    showsVerticalScrollIndicator={false}
                  />
                </View>

                <View style={styles.dashboardSection}>
                  <FlatList
                    key={`${isHorizontal}`}
                    keyboardShouldPersistTaps="handled"
                    data={htmlItems}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={
                      ({ item, index }) =>
                        renderDashboardItem({ item, index, isFromHtml: true, isFromMenu: true }) // 👈 custom prop passed here
                    }
                    showsVerticalScrollIndicator={false}
                  />
                </View>
               
              </>
            )}
          />
        </>
      )}
    </View>
  );
};

export default HomeScreen;
