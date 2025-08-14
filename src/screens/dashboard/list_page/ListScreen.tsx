import { Text, View, FlatList, Image, TextInput, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native'
import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo } from 'react'
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
  const [showDatePicker, setShowDatePicker] = useState<null | { type: 'from' | 'to'; show: boolean }>(null);
  const [refreshing, setRefreshing] = useState(false);
const screenWidth = Dimensions.get('window').width;

  const route = useRoute<RouteProp<ListRouteParams, 'List'>>();
  const { item } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: item?.title || 'List Data' ,
      headerRight: () => (
      <TouchableOpacity onPress={()=>{
        console.log("🚀 ~ onPress:", 'onRefresh')

        onRefresh();
      }} style={{ marginRight: 16 }}>
        <Image 
        source={ERP_ICON.REFRESH}
        style={{ width: 18, height: 18, }}
        alt="Refresh Icon"
        />
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

  const onRefresh = async () => {
  console.log("🚀 ~ onRefresh ~ onRefresh:", 'onRefresh')

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

const parseCustomDate = (dateStr: string): Date =>{
  const [day, monthStr, year] = dateStr.split('-');
  const month = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
  ].indexOf(monthStr);
  return new Date(Number(year), month, Number(day));
}
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
console.log("🚀 ~ allKeys:", allKeys)
function splitInto4Columns(keys: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = { clm1: [], clm2: [], clm3: [], clm4: [] };

  // Filter out keys starting with "btn_"
  const filteredKeys = keys.filter(key => !key.startsWith('btn_'));

  // First 4 keys — one per column
  const firstFour = filteredKeys.slice(0, 4);
  const rest = filteredKeys.slice(4);

  result.clm1.push(firstFour[0] || '');
  result.clm2.push(firstFour[1] || '');
  result.clm3.push(firstFour[2] || '');
  result.clm4.push(firstFour[3] || '');

  // Distribute remaining keys round-robin
  rest.forEach((key, index) => {
    const colIndex = index % 4;
    const columnKey = `clm${colIndex + 1}` as keyof typeof result;
    result[columnKey].push(key);
  });

  return result;
}

 function splitInto4Rows(keys: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = { clm1: [], clm2: [], clm3: [], clm4: [] };

  // First 4 keys — one per column
  const firstFour = keys.slice(0, 4);
  const rest = keys.slice(4);

  result.clm1.push(firstFour[0] || '');
  result.clm2.push(firstFour[1] || '');
  result.clm3.push(firstFour[2] || '');
  result.clm4.push(firstFour[3] || '');

  // Distribute remaining keys round-robin
  rest.forEach((key, index) => {
    const colIndex = index % 4;
    const columnKey = `clm${colIndex + 1}` as keyof typeof result;
    result[columnKey].push(key);
  });

  return result;
}

const columns = splitInto4Columns(allKeys);
const rows = splitInto4Rows(allKeys);

console.log("🚀 ~ columns:", columns)

const TableHeader = () => (
  <View style={[styles.tableRow, styles.tableHeaderRow]}>
    {Object.values(columns).map((colItems, colIndex) => (
      <View key={`col-${colIndex}`} style={{ flexDirection: 'column', marginRight: 1 }}>
        {colItems.map(key => (
          <Text
            key={key}
            style={[styles.tableHeaderCell, { minWidth: 96, maxWidth: 100, marginBottom: 0 }]}
            numberOfLines={1}
          >
            {formatHeaderTitle(key)}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

const renderItem = ({ item, index }: { item: any; index: number }) => {
  const isEven = index % 2 === 0;
  const rowBackgroundColor = isEven ? '#ffffff' : '#f8faf3ff';

  const btnKeys = Object.keys(item).filter(key => key.startsWith('btn_'));
 
  return (
    <> <View style={[styles.tableRow, { backgroundColor: rowBackgroundColor, flexDirection: 'row' }]}>
      {Object.values(rows).map((colItems, colIndex) => (
    <View key={`row-col-${colIndex}`} style={{ flexDirection: 'column', marginRight: 1 }}>
        {colItems
          .filter(key => !key.startsWith('btn_'))  // <-- filter out keys starting with "btn_"
          .map(key => {
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
                key={`${key}-${item?.id || Math.random()}`}
                style={[styles.tableCell, { minWidth: 96, maxWidth: 100, marginBottom: 0 }]}
                numberOfLines={1}
              >
                {value || '-'}
              </Text>
            );
          })}
      </View>
    ))}


    </View>
     <View 
      style={{ 
        borderBottomWidth: 1, 
        borderBottomColor: '#ccc', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        alignItems: 'center', 
        minWidth: 120 
      }}
    >
  {btnKeys.map((key, idx) => {
    const label = item[key] || 'Action';
    const [, , hex] = key.split('_');

    return (
      <TouchableOpacity
        key={`${key}-${idx}`}
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          backgroundColor: `#${hex}`,
          borderRadius: 4,
          marginRight: 6,
          marginBottom: 4,
          flexGrow: 1,
          flexBasis: 'auto',   
          maxWidth: (screenWidth - 40) / 4,
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 50,
        }}
        onPress={() => Alert.alert(`${label} pressed`)}
      >
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }} numberOfLines={1} ellipsizeMode="tail">
          {label.split('_')[0]}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
    </>
   
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
    minimumDate={
      showDatePicker?.type === 'from'
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        : new Date()
    }
    maximumDate={
      showDatePicker?.type === 'from'
        ? new Date()
        : undefined
    }
  />
)}



  {!!error ? <Text style={styles.errorText}>{error}</Text> : <> {loadingListId ? (
             <FullViewLoader />
      ) : <>
       <FlatList
        data={[""]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() =>{
        return ( <TableHeader />)
       }}
       renderItem={() =>{
        return(
          <FlatList
                          showsVerticalScrollIndicator={false}
                          data={filteredData}
                          keyExtractor={(item, idx) => String(item?.id || idx)}
                          renderItem={renderItem}
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
        )
       }}
       >
        
        </FlatList>
      </>}
      </>}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => Alert.alert("Add button clicked")}
      >
        <Text style={styles.addButtonText}>+ New</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListScreen;