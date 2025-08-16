import {
  Text,
  View,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Linking,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { useAppDispatch } from '../../../store/hooks';
import { getERPListDataThunk } from '../../../store/slices/auth/thunk';
import { styles } from './list_page_style';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatHeaderTitle } from '../../../utils/helpers';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import NoData from '../../../components/no_data/NoData';
import { ListRouteParams } from './types';
import { ERP_ICON } from '../../../assets';

const ListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<null | {
    type: 'from' | 'to';
    show: boolean;
  }>(null);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const route = useRoute<RouteProp<ListRouteParams, 'List'>>();
  const { item } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: item?.title || 'List Data',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            console.log('🚀 ~ onPress:', 'onRefresh');

            onRefresh();
          }}
          style={{ marginRight: 16 }}
        >
          <Image source={ERP_ICON.REFRESH} style={{ width: 18, height: 18 }} alt="Refresh Icon" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, item?.title]);

  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getCurrentMonthRange = useCallback(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date();
    const fromDateStr = formatDateForAPI(firstDay);
    const toDateStr = formatDateForAPI(lastDay);
    setFromDate(fromDateStr);
    setToDate(toDateStr);
    return { fromDate: fromDateStr, toDate: toDateStr };
  }, []);

  const debouncedSearch = useCallback(
    useMemo(() => {
      let timeoutId: NodeJS.Timeout;

      return (query: string, data: any[]) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          const trimmedQuery = query.trim();

          if (trimmedQuery === '') {
            setFilteredData(data);
            return;
          }

          const keySearchMatch = trimmedQuery.match(/^(\w+):(.+)$/);
          let filtered;

          if (keySearchMatch) {
            const [, key, value] = keySearchMatch;
            const lowerValue = value.trim().toLowerCase();

            filtered = data.filter(item => {
              const fieldValue = item[key];
              if (!fieldValue) return false;

              const stringValue =
                typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue);

              return stringValue.toLowerCase().includes(lowerValue);
            });
          } else {
            filtered = data.filter(item => {
              const allValues = Object.values(item)
                .map(val => {
                  if (typeof val === 'object' && val !== null) return JSON.stringify(val);
                  if (val === null || val === undefined) return '';
                  return String(val);
                })
                .join(' ')
                .toLowerCase();
              return allValues.includes(trimmedQuery.toLowerCase());
            });
          }
          setFilteredData(filtered);
        }, 300);
      };
    }, []),
    [],
  );

  const onRefresh = async () => {
    console.log('🚀 ~ onRefresh ~ onRefresh:', 'onRefresh');

    try {
      setRefreshing(true);
      await fetchListData(fromDate, toDate);
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text, listData);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredData(listData);
  };

  const parseCustomDate = (dateStr: string): Date => {
    const [day, monthStr, year] = dateStr.split('-');
    const month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ].indexOf(monthStr);
    return new Date(Number(year), month, Number(day));
  };
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate) {
      setShowDatePicker(null);
      return;
    }
    const { type } = showDatePicker!;
    const formattedDate = formatDateForAPI(selectedDate);

    if (type === 'to') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (selectedDate > today) {
        Alert.alert('Invalid Date', 'Cannot select future dates.', [{ text: 'OK' }]);
        setShowDatePicker(null);
        return;
      }
      if (fromDate) {
        const fromDateObj = new Date(fromDate.split('-').reverse().join('-'));
        if (selectedDate < fromDateObj) {
          Alert.alert('Invalid Date Range', 'To date cannot be before From date.', [
            { text: 'OK' },
          ]);
          setShowDatePicker(null);
          return;
        }
      }
      setToDate(formattedDate);
    } else {
      setFromDate(formattedDate);
      if (toDate) {
        const toDateObj = new Date(toDate.split('-').reverse().join('-'));
        if (selectedDate > toDateObj) {
          setToDate('');
        }
      }
    }
    setShowDatePicker(null);
  };

  const fetchListData = useCallback(
    async (fromDateStr: string, toDateStr: string) => {
      try {
        setError(null);
        setLoadingListId(item.id);

        const raw = await dispatch(
          getERPListDataThunk({
            page: item.name,
            fromDate: fromDateStr,
            toDate: toDateStr,
          }),
        ).unwrap();

        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

        let dataArray = [];
        if (Array.isArray(parsed)) {
          dataArray = parsed;
        } else if (Array.isArray(parsed?.data)) {
          dataArray = parsed.data;
        } else if (Array.isArray(parsed?.list)) {
          dataArray = parsed.list;
        } else if (parsed && typeof parsed === 'object') {
          const keys = Object.keys(parsed).filter(key => !isNaN(Number(key)));
          if (keys.length > 0) {
            dataArray = keys.map(key => parsed[key]);
          }
        }

        setListData(dataArray);
        setFilteredData(dataArray);
      } catch (e: any) {
        console.log('Failed to load list data:', e);
        setError(e?.message || 'Failed to load list data');
      } finally {
        setLoadingListId(null);
      }
    },
    [item, dispatch],
  );

  useEffect(() => {
    const { fromDate: initialFromDate, toDate: initialToDate } = getCurrentMonthRange();
    fetchListData(initialFromDate, initialToDate);
  }, [getCurrentMonthRange, fetchListData]);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchListData(fromDate, toDate);
    }
  }, [fromDate, toDate]);

  // Map status to colors
  const statusColors: Record<string, string> = {
    active: '#4CAF50',
    inactive: '#F44336',
    pending: '#FF9800',
    approved: '#2196F3',
    default: '#888888',
  };

  const getStatusColor = (status: string) => {
    if (!status) return statusColors.default;
    const key = status.toLowerCase();
    return statusColors[key] || statusColors.default;
  };
  const findKeyByKeywords = (obj: any, keywords: string[]) => {
    if (!obj) return null;
    const lowerKeys = Object.keys(obj).map(k => k.toLowerCase());
    for (const keyword of keywords) {
      const found = lowerKeys.find(k => k.includes(keyword.toLowerCase()));
      if (found) return found;
    }
    return null;
  };
  const SOCIAL_KEYS = ['linkedin', 'facebook', 'twitter', 'instagram', 'github', 'website'];
  const RenderCard = ({ item, index }: any) => {
    const [expanded, setExpanded] = useState(false);

    const nameKey = findKeyByKeywords(item, ['deptname', 'fullname', 'name']) || 'id';
    console.log('🚀 ~ RenderCard ~ nameKey:', nameKey);
    const subNameKey = findKeyByKeywords(item, ['branchname', 'fullname', 'name']) || 'id';

    const statusKey = findKeyByKeywords(item, ['status', 'state', 'flag']);
    const dateKey = findKeyByKeywords(item, ['date', 'cdt', 'created', 'birthdate']);
    const remarksKey = findKeyByKeywords(item, ['remark', 'comments', 'note']);
    const addressKey = findKeyByKeywords(item, ['address', 'location', 'place']);
    const amountKey = findKeyByKeywords(item, ['amount', 'price', 'cost', 'total']);

    const name = item[nameKey] || `Item #${index + 1}`;
    const subName = item[subNameKey] || `Item #${index + 1}`;

    const status = statusKey ? item[statusKey] : '';
    const date = dateKey ? item[dateKey] : '';
    const remarks = remarksKey ? item[remarksKey] : '';
    const address = addressKey ? item[addressKey] : '';
    const amount = amountKey ? item[amountKey] : '';

    const btnKeys = Object.keys(item).filter(key => key.startsWith('btn_'));

    const filteredKeys = Object.keys(item).filter(
      key =>
        !key.startsWith('btn_') &&
        key !== nameKey &&
        key !== statusKey &&
        key !== dateKey &&
        key !== remarksKey &&
        key !== addressKey &&
        key !== amountKey &&
        item[key] !== null &&
        item[key] !== '',
    );

    const avatarLetter = name
      .split('')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    const renderDetailRow = key => {
      let value = item[key];

      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }

      if (
        key.toLowerCase().includes('image') &&
        typeof value === 'string' &&
        value.startsWith('http')
      ) {
        return (
          <Image
            key={key}
            source={{ uri: value }}
            style={{ width: 100, height: 100, borderRadius: 8, marginBottom: 10 }}
            resizeMode="cover"
          />
        );
      }

      if (
        SOCIAL_KEYS.includes(key.toLowerCase()) &&
        typeof value === 'string' &&
        value.startsWith('http')
      ) {
        return (
          <Text
            key={key}
            style={{ color: '#1e90ff', marginBottom: 8 }}
            onPress={() => Linking.openURL(value)}
          >
            {formatHeaderTitle(key)}: {value}
          </Text>
        );
      }

      return (
        <View
          key={key}
          style={{
            flexDirection: 'row',
            marginBottom: 8,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingBottom: 8,
            paddingRight: 16,
          }}
        >
          <Text
            style={{
              color: '#5f5d5dff',
              fontSize: 16,
              lineHeight: 20,
              marginRight: 8,
            }}
            numberOfLines={1}
          >
            {formatHeaderTitle(key)}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: '#333',
              textAlign: 'right',
              fontWeight: '600',
              flexShrink: 1,
            }}
          >
            {String(value)}
          </Text>
        </View>
      );
    };

    return (
      <View
        style={{
          backgroundColor: item?.success === '1' ? '#f2f7f0ff' : '#fff',
          borderRadius: 8,
          padding: 16,
          marginVertical: 4,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#87bcf5ff',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{avatarLetter}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ fontSize: 12 }} numberOfLines={1}>
              {subName}
            </Text>
            {!!date && <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{date}</Text>}
          </View>

          {!!status && (
            <View
              style={{
                backgroundColor: getStatusColor(status),
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>{status}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Metadata Preview */}
        {(remarks || address || amount) && (
          <View style={{ marginTop: 12 }}>
            {!!remarks && (
              <Text style={{ color: '#777', fontStyle: 'italic', marginBottom: 6 }}>{remarks}</Text>
            )}
            {!!address && <Text style={{ color: '#444', marginBottom: 6 }}>📍 {address}</Text>}
            {!!amount && <Text style={{ fontWeight: '700', color: '#28a745' }}>₹ {amount}</Text>}
          </View>
        )}

        {/* Expandable Details */}
        {expanded && (
          <View
            style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }}
          >
            {filteredKeys.length === 0 ? (
              <Text style={{ fontStyle: 'italic', color: '#999' }}>No extra details</Text>
            ) : (
              filteredKeys.map(renderDetailRow)
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={{ marginTop: 12, alignItems: 'center' }}
        >
          <Text
            style={{ color: '#b1b4b8ff', fontWeight: '600', textAlign: 'center', fontSize: 14 }}
          >
            {expanded ? 'Hide Details ▲' : 'Show Details ▼'}
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        {expanded && btnKeys.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 }}>
            {btnKeys.map((key, idx) => {
              const label = item[key] || 'Action';
              const [, , hex] = key.split('_');

              return (
                <TouchableOpacity
                  key={`${key}-${idx}`}
                  style={{
                    backgroundColor: `#${hex}`,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    flexGrow: 1,
                    maxWidth: (screenWidth - 64) / 2,
                    alignItems: 'center',
                  }}
                  onPress={() => Alert.alert(`${label} pressed`)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                    {label.split('_')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search in list..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#6C757D"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.dateContainer}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>From Date:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker({ type: 'from', show: true })}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>{fromDate || 'Select Date'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>To Date:</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker({ type: 'to', show: true })}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>{toDate || 'Select Date'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker?.show && (
        <DateTimePicker
          value={
            showDatePicker?.type === 'from' && fromDate ? parseCustomDate(fromDate) : new Date()
          }
          mode="date"
          onChange={handleDateChange}
          minimumDate={
            showDatePicker?.type === 'from'
              ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              : new Date()
          }
          maximumDate={showDatePicker?.type === 'from' ? new Date() : undefined}
        />
      )}

      {!!error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          {' '}
          {loadingListId ? (
            <FullViewLoader />
          ) : (
            <>
              <FlatList
                data={filteredData}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, idx) => String(item?.id || idx)}
                renderItem={({ item, index }) => <RenderCard item={item} index={index} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  !loadingListId ? (
                    <View
                      style={{
                        width: Dimensions.get('screen').width,
                        height: Dimensions.get('screen').height / 2.5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <NoData />
                    </View>
                  ) : null
                }
              />
            </>
          )}
        </>
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add button clicked')}>
        <Text style={styles.addButtonText}>+ New</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListScreen;
