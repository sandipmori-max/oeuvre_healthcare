import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';

import { styles } from './home_style';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { DashboardItem } from '../../../../store/slices/auth/type';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import NoData from '../../../../components/no_data/NoData';
import ERPIcon from '../../../../components/icon/ERPIcon';
import { PieChart } from 'react-native-gifted-charts';
import { getERPDashboardThunk } from '../../../../store/slices/auth/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';
const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const { dashboard, isDashboardLoading, isAuthenticated, activeToken, error } = useAppSelector(
    state => state.auth,
  );
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);

  const theme = useAppSelector(state => state.theme);
  const [actionLoader, setActionLoader] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon
            name="refresh"
            onPress={() => {
              setActionLoader(true);
              setIsRefresh(!isRefresh);
            }}
            isLoading={actionLoader}
          />
        </>
      ),
      headerLeft: () => (
        <>
          <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation.openDrawer()} />
        </>
      ),
    });
  }, [navigation, isRefresh, actionLoader]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getERPDashboardThunk());
      setTimeout(() => {
        setActionLoader(false);
      }, 100);
    }
  }, [isAuthenticated, dispatch, activeToken, isRefresh]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        dispatch(getERPDashboardThunk());
      }
      return () => {};
    }, [isAuthenticated, dispatch]),
  );

  const getInitials = (text?: string) => {
    if (!text) return '?';
    const trimmed = text.trim();
    if (trimmed.length === 0) return '?';
    return trimmed.slice(0, 2).toUpperCase();
  };

  const accentColors = ['#4C6FFF', '#00C2A8', '#FFB020', '#FF6B6B', '#9B59B6', '#20C997'];

  const pieChartData = dashboard
    .filter(item => {
      const num = Number(item?.data);
      return item?.data !== '' && !isNaN(num) && num > 0;
    })
    .map((item, index) => ({
      value: Number(item.data),
      color: accentColors[index % accentColors.length],
      text: item.title?.split(' ')[0] || item.name,
    }));

  const renderDashboardItem = (item: DashboardItem, index: number) => {
    console.log('🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ renderDashboardItem ~ item:', item);
    return (
      <TouchableOpacity
        key={item.id || index}
        style={[
          styles.dashboardItem,
          {
            paddingLeft: 4,
            backgroundColor: accentColors[index % accentColors.length],
            borderRadius: 8,
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
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
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
                  <Text style={styles.iconText}>{getInitials(item.name)}</Text>
                </View>
                <View style={styles.headerTextWrap}>
                  <Text
                    style={[
                      styles.dashboardItemText,
                      {
                        color: theme === 'dark' ? '#fff' : '#000',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.title } 
                  </Text>
                </View>
              </View>
            </View>

            {/* Content section */}
            <View style={styles.dashboardItemBody}>
              {loadingPageId === (item.id || String(index)) && (
                <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={{ marginLeft: 8, color: '#6C757D' }}>Loading page...</Text>
                </View>
              )}
              {item.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dashboardItemData} numberOfLines={2}>
                    {item.data}
                  </Text>
                </View>
              )}
            </View>

            {/* Footer action */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              {item?.isReport && (
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>Report</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  if (
                    item?.url.includes('.') ||
                    item?.url.includes('?') ||
                    item?.url.includes('/')
                  ) {
                    navigation.navigate('Web', { item });
                  } else {
                    navigation.navigate('List', { item });
                  }
                }}
                style={styles.cardFooter}
              >
                <Text style={styles.footerLink}>View</Text>
                <MaterialIcons name={'chevron-right'} color={'#ccc'} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLoadingState = () => <FullViewLoader />;

  const renderEmptyState = () => <NoData />;

  return (
    <View>
      <FlatList
      showsVerticalScrollIndicator={false}
      data={['']}
      renderItem={() => {
        return (
          <>
            <View style={theme === 'dark' ? styles.containerDark : styles.container}>
              {isDashboardLoading ? (
                <>{renderLoadingState()}</>
              ) : (
                <>
                  {' '}
                  {dashboard.length > 0 && (
                    <View
                      style={{
                        borderColor: '#000',
                        borderBottomWidth: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('Web', { isFromChart: true });
                        }}
                        style={styles.chartContainer}
                      >
                        <PieChart
                          data={pieChartData}
                          donut
                          radius={90}
                          textSize={14}
                          innerRadius={50}
                          textColor="#000"
                          showValuesAsLabels
                          labelPosition="outside"
                          innerCircleColor="#fff"
                          centerLabelComponent={() => (
                            <Text
                              style={{
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: '#000',
                              }}
                            >
                              Home
                            </Text>
                          )}
                        />
                      </TouchableOpacity>
                      <View
                        style={{
                          justifyContent: 'center',
                          marginTop: 16,
                        }}
                      >
                        {pieChartData.map((item, idx) => (
                          <View
                            key={idx}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginHorizontal: 8,
                              marginBottom: 8,
                            }}
                          >
                            <View
                              style={{
                                width: 16,
                                height: 16,
                                borderRadius: 8,
                                backgroundColor: item.color,
                                marginRight: 6,
                              }}
                            />
                            <Text style={{ fontSize: 14, color: '#444' }}>
                              {item.text}: {item.value}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  <View style={styles.dashboardSection}>
                    {isDashboardLoading ? (
                      renderLoadingState()
                    ) : dashboard.length > 0 ? (
                      <View style={styles.dashboardGrid}>{dashboard.map(renderDashboardItem)}</View>
                    ) : (
                      renderEmptyState()
                    )}
                  </View>{' '}
                </>
              )}
            </View>
          </>
        );
      }}
    />
    </View>
  );
};

export default HomeScreen;
