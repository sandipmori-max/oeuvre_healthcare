import { Text, View, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native'
import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { getERPListDataThunk } from '../../../store/slices/auth/thunk';
import { styles } from './list_page_style';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatHeaderTitle } from '../../../utils/helpers';
import FullViewLoader from '../../../components/FullViewLoader';
import NoData from '../../../components/NoData';

type ListRouteParams = { List: { item: any } };

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
  const [showDatePicker, setShowDatePicker] = useState<null | { type: 'from' | 'to'; show: boolean }>(null);

  const route = useRoute<RouteProp<ListRouteParams, 'List'>>();
  const { item } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: item?.title || 'List Data' });
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
    const lastDay = new Date()
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

        // Detect key:value syntax
        const keySearchMatch = trimmedQuery.match(/^(\w+):(.+)$/);
        let filtered;

        if (keySearchMatch) {
          const [, key, value] = keySearchMatch;
          const lowerValue = value.trim().toLowerCase();

          filtered = data.filter(item => {
            const fieldValue = item[key];
            if (!fieldValue) return false;

            const stringValue = typeof fieldValue === 'object'
              ? JSON.stringify(fieldValue)
              : String(fieldValue);

            return stringValue.toLowerCase().includes(lowerValue);
          });
        } else {
          // 🔄 Search across all keys dynamically
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
  []
);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text, listData);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredData(listData);
  };
function parseCustomDate(dateStr: string): Date {
  // dateStr: "01-Aug-2025"
  const [day, monthStr, year] = dateStr.split('-');
  const month = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ].indexOf(monthStr);
  return new Date(Number(year), month, Number(day));
}
 const handleDateChange = (event: any, selectedDate?: Date) => {
  // Cancel button pressed
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
        Alert.alert('Invalid Date Range', 'To date cannot be before From date.', [{ text: 'OK' }]);
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

  const fetchListData = useCallback(async (fromDateStr: string, toDateStr: string) => {
    try {
      setError(null);
      setLoadingListId(item.id);

      const raw = await dispatch(getERPListDataThunk({
        page: item.name,
        fromDate: fromDateStr,
        toDate: toDateStr
      })).unwrap();

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
  }, [item, dispatch]);

  useEffect(() => {
    const { fromDate: initialFromDate, toDate: initialToDate } = getCurrentMonthRange();
    fetchListData(initialFromDate, initialToDate);
  }, [getCurrentMonthRange, fetchListData]);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchListData(fromDate, toDate);
    }
  }, [fromDate, toDate]);

  const allKeys = filteredData && filteredData.length > 0 
  ? Object.keys(filteredData[0]) 
  : [];

  const TableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      {allKeys.map(key => (
        <Text
          key={key}
          style={[styles.tableHeaderCell,{ minWidth: 100, maxWidth: 100 }]}
          numberOfLines={1}
        >
        {formatHeaderTitle(key)}
        </Text>
      ))}
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
  return (
    <View style={styles.tableRow}>
      {allKeys.map(key => {
        let value = item[key];
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        } else if (value === null || value === undefined) {
          value = '';
        } else {
          value = String(value);
        }

        return (
          <Text
            key={key}
            style={[styles.tableCell, { minWidth: 100, maxWidth: 100 }]}
            numberOfLines={1}
          >
            {value}
          </Text>
        );
      })}
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
          <TouchableOpacity onPress={() => setShowDatePicker({ type: 'from', show: true })} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>{fromDate || 'Select Date'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>To Date:</Text>
          <TouchableOpacity onPress={() => setShowDatePicker({ type: 'to', show: true })} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>{toDate || 'Select Date'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker?.show && (
        <DateTimePicker
         value={
    showDatePicker?.type === 'from' && fromDate
      ? parseCustomDate(fromDate)
      : new Date()
  }
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

  {!!error ? <Text style={styles.errorText}>{error}</Text> : <> {loadingListId ? (
             <FullViewLoader />
      ) : <>
       <ScrollView horizontal>
          <FlatList
            data={filteredData}
            keyExtractor={(item, idx) => String(item?.id || idx)}
            renderItem={renderItem}
            ListHeaderComponent={filteredData.length ? TableHeader : null}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={!loadingListId ? (
              <View style={{
                width: Dimensions.get('screen').width,
                height: Dimensions.get('screen').height / 2.5,
                justifyContent:'center', alignContent:'center', alignItems:'center'}}>
                <NoData />
              </View>
            ) : null}
          />
        </ScrollView>
      </>}
      </>}
    </View>
  );
};

export default ListScreen;