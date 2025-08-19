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
import {
  findKeyByKeywords,
  formatDateToDDMMMYYYY,
  formatHeaderTitle,
  formatTimeTo12Hour,
} from '../../../utils/helpers';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import NoData from '../../../components/no_data/NoData';
import { ListRouteParams } from './types';
import { ERP_ICON } from '../../../assets';
import ErrorMessage from '../../../components/error/Error';

const ListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);

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
  console.log('🚀 ~ ListScreen ~ item:', item);

  const pageTitle = item?.title || item?.name || 'List Data';
  const pageParamsName = item?.name || 'List Data';
  console.log('🚀 ~ ListScreen ~ pageParamsName:', pageParamsName);
  const totalAmount = filteredData?.reduce((sum, item) => {
    const amount = parseFloat(item?.amount) || 0;
    return sum + amount;
  }, 0);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: pageTitle || 'List Data',
      headerRight: () => (
        <>
          <TouchableOpacity
            onPress={() => {
              onRefresh();
            }}
            style={{ marginRight: 16 }}
          >
            <Image source={ERP_ICON.REFRESH} style={{ width: 18, height: 18 }} alt="Refresh Icon" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsFilterVisible(!isFilterVisible);
            }}
            style={{ marginRight: 16 }}
          >
            <Image
              source={isFilterVisible ? ERP_ICON.FILTER_ACTIVE : ERP_ICON.FILTER}
              style={{ width: 18, height: 18 }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation, pageTitle, isFilterVisible]);

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
  
  const getButtonMeta = (key: string) => {
    if (!key || !configData?.length) return { label: 'Action', color: '#007BFF' };

    const configItem = configData.find(cfg => cfg.datafield?.toLowerCase() === key.toLowerCase());

    return {
      label: configItem?.headertext || 'Action',
      color: configItem?.colorcode || '#007BFF',
    };
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
            param: '',
          }),
        ).unwrap();
        console.log('🚀 ~ raw:', raw);

        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

        let dataArray = [];
        let configArray = [];

        if (Array.isArray(parsed)) {
          dataArray = parsed;
          configArray = [];
        } else if (Array.isArray(parsed?.data)) {
          dataArray = parsed.data;
          configArray = parsed.config || [];
        } else if (Array.isArray(parsed?.list)) {
          dataArray = parsed.list;
          configArray = parsed.config || [];
        } else if (parsed && typeof parsed === 'object') {
          const keys = Object.keys(parsed).filter(key => !isNaN(Number(key)));
          if (keys.length > 0) {
            dataArray = keys.map(key => parsed[key]);
            configArray = parsed.config || [];
          }
        }
        console.log('🚀 ~ configArray:', configArray);

        setConfigData(configArray);
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

  const RenderCard = ({ item, index }: any) => {
    if (!item) return null;
    const name = item['name'] || `Item #${index + 1}`;
    const subName = item['number'] || `Item #${index + 1}`;
    const [isRemarksExpanded, setRemarksExpanded] = useState(false);

    const status = item['status'];
    const date = item['date'];
    const remarks = item['remarks'];
    const address = item['address'];
    const amount = item['amount'];

    const btnKeys = Object.keys(item).filter(key => key.startsWith('btn_'));

    const avatarLetter = name
      .split('')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return (
      <View
        style={{
          backgroundColor:
            item?.success === '1' ? '#f2f7f0ff' : status === 'DeActive' ? '#fae7e7ff' : '#fff',
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
          onPress={async () => {
            navigation.navigate('Page', { item, title: pageParamsName });
          }}
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
          </View>

          <View
            style={{
              alignSelf: 'flex-end',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            {!!date && <Text style={{ fontWeight: '600' }}>{formatDateToDDMMMYYYY(date)}</Text>}
            {!!date && <Text style={{ color: '#9c9696ff' }}>{formatTimeTo12Hour(date)}</Text>}
          </View>
        </TouchableOpacity>

        {/* Metadata Preview */}
        {(remarks || address || amount) && (
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View
                style={{
                  width: '70%',
                }}
              >
                {!!remarks && (
                  <>
                    <Text
                      numberOfLines={isRemarksExpanded ? undefined : 2}
                      style={{
                        color: '#777',
                        fontStyle: 'italic',
                        marginBottom: 6,
                      }}
                    >
                      {remarks}
                    </Text>
                    {remarks.length > 60 && ( 
                      <TouchableOpacity onPress={() => setRemarksExpanded(prev => !prev)}>
                        <Text style={{ color: '#007bff', fontSize: 12,  marginBottom: 6, }}>
                          {isRemarksExpanded ? 'See Less ▲' : 'See More ▼'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
              <View
                style={{
                  width: '30%',
                  alignItems: 'flex-end',
                }}
              >
                {!!amount && (
                  <Text
                    numberOfLines={1}
                    style={{
                      textAlign: 'right',
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#28a745',
                    }}
                  >
                    ₹ {amount}
                  </Text>
                )}
              </View>
            </View>
            <View>
              {!!address && (
                <Text
                  numberOfLines={2}
                  style={{
                    color: '#444',
                  }}
                >
                  📍 {address}
                </Text>
              )}
            </View>
          </View>
        )}

        {btnKeys.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 }}>
            {btnKeys.map((key, idx) => {
              const actionValue = item[key];
              const { label, color } = getButtonMeta(key);

              return (
                <TouchableOpacity
                  key={`${key}-${idx}`}
                  style={{
                    backgroundColor: color,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 6,
                    flexGrow: 1,
                    maxWidth: (screenWidth - 64) / 2,
                    alignItems: 'center',
                  }}
                  onPress={() => Alert.alert(`${label} pressed`, `Value: ${actionValue}`)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{label}</Text>
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
      {isFilterVisible && (
        <View >
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
        </View>
      )}

      {!!error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
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
                ListFooterComponent={
                  filteredData.length > 0 && totalAmount > 0 ? (
                    <View
                      style={{
                        marginTop: 16,
                        padding: 16,
                        borderRadius: 8,
                        backgroundColor: '#f1f1f1',
                        borderWidth: 1,
                        borderColor: '#ddd',
                        marginBottom: 28
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>
                        Total Amount
                      </Text>
                      <Text
                        style={{ fontSize: 20, fontWeight: 'bold', color: '#28a745', marginTop: 4 }}
                      >
                        ₹ {totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  ) : null
                }
              />
            </>
          )}
        </>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add button clicked')}>
        <Text style={styles.addButtonText}>New</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListScreen;
