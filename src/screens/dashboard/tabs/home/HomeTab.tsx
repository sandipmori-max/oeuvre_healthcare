import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

import { styles } from './home_style';
import { useAppSelector } from '../../../../store/hooks';
import { DashboardItem } from '../../../../store/slices/auth/type';
import { useNavigation } from '@react-navigation/native';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import NoData from '../../../../components/no_data/NoData';
import ERPIcon from '../../../../components/icon/ERPIcon';
import { BarChart, PieChart } from 'react-native-gifted-charts';
const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { dashboard, isDashboardLoading } = useAppSelector(state => state.auth);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const theme = useAppSelector(state => state.theme);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon name="refresh" />
        </>
      ),
      headerLeft: () => (
        <>
          <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation.openDrawer()} />
        </>
      ),
    });
  }, [navigation]);

  const getInitials = (text?: string) => {
    if (!text) return '?';
    const trimmed = text.trim();
    if (trimmed.length === 0) return '?';
    return trimmed.slice(0, 2).toUpperCase();
  };

  const accentColors = ['#4C6FFF', '#00C2A8', '#FFB020', '#FF6B6B', '#9B59B6', '#20C997'];
  const pieChartData = dashboard
    .filter(item => !isNaN(Number(item.data))) // filter numeric data only
    .map((item, index) => ({
      value: Number(item.data),
      color: accentColors[index % accentColors.length],
      text: item.title?.split(' ')[0] || `Item ${index + 1}`,
    }));

  const renderDashboardItem = (item: DashboardItem, index: number) => (
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
        navigation.navigate('List', { item });
      }}
    >
      <View
        style={{
          backgroundColor: theme === 'dark' ? '#333' : '#fff',
          borderRadius: 8,
        }}
      >
        <View style={styles.dashboardItemContent}>
          {/* Header with icon, name and badge */}
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
                  numberOfLines={2}
                >
                  {item.title}
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

            {item.url && (
              <View style={styles.urlContainer}>
                <Text style={styles.dashboardItemUrl} numberOfLines={1}>
                  {item.url}
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
            {item.isReport && (
              <View style={styles.reportBadge}>
                <Text style={styles.reportBadgeText}>Report</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate('Web', { item })}
              style={styles.cardFooter}
            >
              <Text style={styles.footerLink}>View</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingState = () => <FullViewLoader />;

  const renderEmptyState = () => <NoData />;

  return (
    <View style={theme === 'dark' ? styles.containerDark : styles.container}>
      {dashboard.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Overview</Text>
          <PieChart
            data={pieChartData}
            donut
            showText
            radius={90}
            textSize={14}
            innerRadius={50}
            textColor="#333"
            showValuesAsLabels
            labelPosition="outside"
            centerLabelComponent={() => (
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                Total: {pieChartData.reduce((sum, item) => sum + item.value, 0)}
              </Text>
            )}
          />
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
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

      <View style={styles.dashboardSection}>
        {isDashboardLoading ? (
          renderLoadingState()
        ) : dashboard.length > 0 ? (
          <View style={styles.dashboardGrid}>{dashboard.map(renderDashboardItem)}</View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
