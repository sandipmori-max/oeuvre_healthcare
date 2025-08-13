import React, { useState } from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
 
import { styles } from './home_style';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { DashboardItem } from '../../../../store/slices/auth/type';
import { useNavigation } from '@react-navigation/native';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import NoData from '../../../../components/no_data/NoData';
 

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { dashboard, isDashboardLoading} = useAppSelector(state => state.auth);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  
 
  const getInitials = (text?: string) => {
    if (!text) return '?';
    const trimmed = text.trim();
    if (trimmed.length === 0) return '?';
    return trimmed.slice(0, 2).toUpperCase();
  };

  const accentColors = ['#4C6FFF', '#00C2A8', '#FFB020', '#FF6B6B', '#9B59B6', '#20C997'];

  const renderDashboardItem = (item: DashboardItem, index: number) => (
    <TouchableOpacity 
      key={item.id || index} 
      style={styles.dashboardItem}
      activeOpacity={0.7}
      onPress={async () => {
        navigation.navigate('List', {item})
      }}
    >
      <View style={styles.dashboardItemContent}>
        {/* Header with icon, name and badge */}
        <View style={styles.dashboardItemHeader}>
          <View style={styles.dashboardItemTopRow}>
            <View style={[styles.iconContainer, { backgroundColor: accentColors[index % accentColors.length] }]}>
              <Text style={styles.iconText}>{getInitials(item.name)}</Text>
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.dashboardItemText} numberOfLines={2}>
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
        <View style={{
          flexDirection:'row', justifyContent:'space-between', alignContent:'center', 
          alignItems:'center'
        }}>
           {item.isReport && (
              <View style={styles.reportBadge}>
                <Text style={styles.reportBadgeText}>Report</Text>
              </View>
            )}
        <TouchableOpacity
        onPress={() => navigation.navigate('Web', { item })}
        style={styles.cardFooter}>
          <Text style={styles.footerLink}>View</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

         <TouchableOpacity
        onPress={() => navigation.navigate('Page', { item })}
        style={styles.cardFooter}>
          <Text style={styles.footerLink}>Page</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingState = () => (
     <FullViewLoader />
  );

  const renderEmptyState = () => (
    <NoData />
  );

  return (
    <View style={styles.container}>
      
      {/* Dashboard Section */}
      <View style={styles.dashboardSection}>
        {isDashboardLoading ? (
          renderLoadingState()
        ) : dashboard.length > 0 ? (
          <View style={styles.dashboardGrid}>
            {dashboard.map(renderDashboardItem)}
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

export default HomeScreen;