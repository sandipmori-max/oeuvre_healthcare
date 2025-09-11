import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import NoData from '../../../../components/no_data/NoData';
import { PieChart } from 'react-native-gifted-charts';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { useAppDispatch } from '../../../../store/hooks';
import { getERPListDataThunk } from '../../../../store/slices/auth/thunk';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'leave', label: 'Leave' },
  { key: 'leave_first_half', label: 'First Half' },
  { key: 'leave_second_half', label: 'Second Half' },
  { key: 'late', label: 'Late Entry' },
  { key: 'after_830', label: '8:30 >' },
  { key: 'before_830', label: '8:30 <' },
];

const styles = StyleSheet.create({
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 0.5,
  },
  recordAvatar: { width: 50, height: 50, borderRadius: 25 },
  recordName: { fontSize: 16 },
  recordDateTime: { fontWeight: '600', fontSize: 12, color: '#000' },
  recordPunchTime: { fontSize: 14, color: '#333' },
  statusBadgeRed: {
    backgroundColor: '#fa1b1bff',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statusBadgeBlue: {
    backgroundColor: '#a6bfc9ff',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statusBadgeGrey: {
    backgroundColor: '#dad1d1',
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

const List = ({ selectedMonth, showFilter, fromDate, toDate }: any) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [listData, setListData] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [parsedError, setParsedError] = useState<any>();
  const [baseLink, setBaseLink] = useState<string>('');
  console.log('🚀 ~ List ~ baseLink:', baseLink);

  const getWorkedHours = (punchIn: string, punchOut: string): number => {
    if (!punchIn || !punchOut) return 0;
    const [inH, inM] = punchIn.split(':').map(Number);
    const [outH, outM] = punchOut.split(':').map(Number);

    const inDate = new Date(0, 0, 0, inH, inM);
    const outDate = new Date(0, 0, 0, outH, outM);

    const diffMs = outDate.getTime() - inDate.getTime();
    return diffMs / 1000 / 60 / 60;
  };

  const isLatePunchIn = (punchIn: string): boolean => {
    if (!punchIn) return false;
    const [hours, minutes] = punchIn.split(':').map(Number);
    return hours > 10 || (hours === 10 && minutes > 15);
  };

  const isAfter830 = (punchIn: string) => {
    if (!punchIn) return false;
    const [hours, minutes] = punchIn.split(':').map(Number);
    if (hours > 8) return true;
    if (hours === 8 && minutes > 30) return true;
    return false;
  };

  const isBefore830 = (punchIn: string) => {
    if (!punchIn) return false;
    const [hours, minutes] = punchIn.split(':').map(Number);
    if (hours < 8) return true;
    if (hours === 8 && minutes < 30) return true;
    return false;
  };

  const fetchListData = useCallback(
    async (fromDateStr: string, toDateStr: string) => {
      try {
        setIsLoading(true);
        const raw = await dispatch(
          getERPListDataThunk({
            page: 'PunchIn',
            fromDate: fromDateStr,
            toDate: toDateStr,
            param: '',
          }),
        ).unwrap();

        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const final = parsed?.d ? JSON.parse(parsed.d) : parsed;
        setListData(final?.data || final || []);
      } catch (e: any) {
        console.log('Failed to load list data:', e);
        setParsedError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (fromDate && toDate) {
      fetchListData(fromDate, toDate);
    }
  }, [fromDate, toDate, fetchListData]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedLink] = await Promise.all([AsyncStorage.getItem('erp_link')]);

        if (isMounted) {
          let normalizedBase = (storedLink || '').replace(/\/+$/, '') + '';
          normalizedBase = normalizedBase.replace(/\/devws\/?/, '/');
          normalizedBase = normalizedBase.replace(/^https:\/\//i, 'http://');
          setBaseLink(normalizedBase || '');
        }
      } catch (e) {
        console.error('Error loading stored data:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  // ---- Filters ----
  let data = listData?.length > 0 ? [...listData] : [];
  if (data && activeFilter !== 'all') {
    switch (activeFilter) {
      case 'leave':
        data = data.filter(item => item.status?.toLowerCase() === 'leave');
        break;
      case 'leave_first_half':
        data = data.filter(item => item.status?.toLowerCase() === 'leave_first_half');
        break;
      case 'leave_second_half':
        data = data.filter(item => item.status?.toLowerCase() === 'leave_second_half');
        break;
      case 'late':
        data = data.filter(item => item.intime && isLatePunchIn(item.intime));
        break;
      case 'after_830':
        data = data.filter(item => item.intime && isAfter830(item.intime));
        break;
      case 'before_830':
        data = data.filter(item => item.intime && isBefore830(item.intime));
        break;
    }
  }

  const total = listData.length > 0 && listData?.length;
  const leave =
    listData.length > 0 && listData?.filter(i => i.status?.toLowerCase() === 'leave').length;
  const late =
    listData.length > 0 && listData?.filter(i => i.intime && isLatePunchIn(i.intime)).length;
  const lessHours =
    listData.length > 0 &&
    listData?.filter(i => {
      if (!i.intime || !i.outtime) return false;
      return getWorkedHours(i.intime, i.outtime) < 8.5;
    }).length;
  const present = total - leave;

  const chartData = [
    { value: present, color: '#4caf50', text: 'Present' },
    { value: leave, color: '#f44336', text: 'Leave' },
    { value: late, color: '#a6bfc9ff', text: 'Late' },
    { value: lessHours, color: '#ff9800', text: 'Less Hrs' },
  ];

  if (parsedError) {
    return (
      <View style={{ flex: 1 }}>
        <Text>{JSON.stringify(parsedError)}</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View>
        {showFilter && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' }}
            contentContainerStyle={{ alignItems: 'center', gap: 6 }}
          >
            {FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={[
                  {
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 4,
                    borderWidth: 1,
                  },
                  activeFilter === filter.key
                    ? { backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR, borderColor: '#fff' }
                    : { backgroundColor: '#fff', borderColor: '#ccc' },
                ]}
              >
                <Text
                  style={{
                    color: activeFilter === filter.key ? '#fff' : '#000',
                    fontWeight: '600',
                  }}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <FlatList
        data={['']}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <>
            {listData?.length > 0 && (
              <View
                style={{
                  justifyContent: 'space-around',
                  padding: 16,
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <PieChart
                  data={chartData}
                  donut
                  radius={90}
                  innerRadius={60}
                  centerLabelComponent={() => (
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        fontWeight: '600',
                      }}
                    >
                      {total + `\n`} Days
                    </Text>
                  )}
                />
                <View style={{ marginTop: 12, gap: 12, marginHorizontal: 20 }}>
                  {chartData.map((c, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: c.color,
                        }}
                      />
                      <Text>{`${c.text} (${c.value})`}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* List Data */}
            {isLoading ? (
              <FullViewLoader />
            ) : data?.length === 0 ? (
              <View
                style={{
                  height: Dimensions.get('screen').height * 0.45,
                  width: '100%',
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <NoData />
              </View>
            ) : (
              <FlatList
                data={data}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isLeaveFull = item?.status?.toLowerCase() === 'leave';
                  const workedHours =
                    !item?.intime || !item?.outtime
                      ? 0
                      : getWorkedHours(item?.intime, item?.outtime);
                  const isLessThanRequired = !isLeaveFull && workedHours < 8.5;

                  const isLate = !isLeaveFull && item?.intime && isLatePunchIn(item?.intime);

                  return (
                    <View style={styles.recordCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                          source={{ uri: baseLink + '/' + item?.image }}
                          style={styles.recordAvatar}
                        />
                        {item?.image2 && (
                          <Image
                            source={{ uri: baseLink + '/' + item?.image2 }}
                            style={[
                              styles.recordAvatar,
                              { marginLeft: -32, borderWidth: 2, borderColor: '#fff' },
                            ]}
                          />
                        )}
                      </View>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}
                        >
                          <Text style={styles.recordName}>{item?.employee}</Text>
                          <Text style={styles.recordDateTime}>{item?.date}</Text>
                        </View>

                        {/* Punch Times */}
                        {!isLeaveFull && (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons color={'#666'} size={14} name="hourglass-bottom" />
                              <Text style={styles.recordPunchTime}>{item?.intime || '--'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons color={'#666'} size={14} name="query-builder" />
                              <Text style={styles.recordPunchTime}>
                                {(workedHours - 1).toFixed(2) + ' hr' || '--'}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons color={'#666'} size={14} name="hourglass-top" />
                              <Text style={styles.recordPunchTime}>{item?.outtime || '--'}</Text>
                            </View>
                          </View>
                        )}

                        {/* Status Badges */}
                        {isLeaveFull && <Text style={styles.statusBadgeRed}>Leave</Text>}
                        {isLate && <Text style={styles.statusBadgeBlue}>Late</Text>}
                        {isLessThanRequired && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.statusBadgeGrey}>Less Hours</Text>
                            <Text style={styles.statusBadgeGrey}>
                              ({workedHours.toFixed(2)} hrs)
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </>
        )}
      />
    </View>
  );
};

export default List;
