import { Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import { useAppDispatch } from '../../../store/hooks';
import { getERPListDataThunk } from '../../../store/slices/auth/thunk';
import { styles } from './list_page_style';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateForAPI, parseCustomDate } from '../../../utils/helpers';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import { ListRouteParams } from './types';
import ErrorMessage from '../../../components/error/Error';
import TableView from './components/TableView';
import RedableView from './components/RedableView';
import ERPIcon from '../../../components/icon/ERPIcon';

const ListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
  const [isTableView, setIsTableView] = useState<boolean>(false);

  const [filteredData, setFilteredData] = useState<any[]>([]);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<null | {
    type: 'from' | 'to';
    show: boolean;
  }>(null);

  const route = useRoute<RouteProp<ListRouteParams, 'List'>>();
  const { item } = route.params;

  const pageTitle = item?.title || item?.name || 'List Data';
  const pageParamsName = item?.name || 'List Data';

  const totalAmount = filteredData?.reduce((sum, item) => {
    const amount = parseFloat(item?.amount) || 0;
    return sum + amount;
  }, 0);

  const hasDateField = configData.some(
    item => item.datafield && item.datafield.toLowerCase() === 'date',
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: pageTitle || 'List Data',
      headerRight: () => (
        <>
          <ERPIcon
            name={isTableView ? 'list' : 'apps'}
            onPress={() => {
              setIsTableView(!isTableView);
            }}
          />

          <ERPIcon
            name={!hasDateField ? 'search' : isFilterVisible ? 'filter-alt' : 'filter-alt'}
            onPress={() => {
              setIsFilterVisible(!isFilterVisible);
            }}
          />

          <ERPIcon
            name="refresh"
            onPress={() => {
              onRefresh();
            }}
          />
        </>
      ),
    });
  }, [navigation, pageTitle, isFilterVisible, hasDateField, isTableView]);

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
    try {
      await fetchListData(fromDate, toDate);
    } catch (e) {
      console.error('Refresh failed', e);
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
            param: '',
          }),
        ).unwrap();
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

  useFocusEffect(
    useCallback(() => {
      const { fromDate: initialFromDate, toDate: initialToDate } = getCurrentMonthRange();
      fetchListData(initialFromDate, initialToDate);
      return () => {};
    }, [getCurrentMonthRange, fetchListData]),
  );
  return (
    <View style={styles.container}>
      {isFilterVisible && (
        <View>
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

          {hasDateField && (
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
          )}

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
              {isTableView ? (
                <>
                  <TableView
                    configData={configData}
                    filteredData={filteredData}
                    loadingListId={loadingListId}
                    totalAmount={totalAmount}
                    pageParamsName={pageParamsName}
                  />
                </>
              ) : (
                <>
                  <RedableView
                    configData={configData}
                    filteredData={filteredData}
                    loadingListId={loadingListId}
                    totalAmount={totalAmount}
                    pageParamsName={pageParamsName}
                  />
                </>
              )}
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
