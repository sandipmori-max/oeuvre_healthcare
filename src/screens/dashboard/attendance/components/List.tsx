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
  Alert,
  PanResponder,
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
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 0.5,
  },
  recordAvatar: { width: 50, height: 50, borderRadius: 25 },
  recordName: { fontSize: 14 },
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
  const [baseLink, setBaseLink] = useState('');
  const [parsedError, setParsedError] = useState<any>();
  const dispatch = useAppDispatch();
  const [currentView, setCurrentView] = useState<'pie' | 'calendar'>('pie');

  const normalizeDate = (dateStr: string) => {
    const [day, monthStr, year] = dateStr.split(' ');
    const monthMap: Record<string, string> = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    };
    return `${year}-${monthMap[monthStr]}-${day.padStart(2, '0')}`;
  };

  const getWorkedHours = (punchIn: string, punchOut: string): number => {
    if (!punchIn || !punchOut) return 0;
    const [inH, inM] = punchIn.split(':').map(Number);
    const [outH, outM] = punchOut.split(':').map(Number);
    const inDate = new Date(0, 0, 0, inH, inM);
    const outDate = new Date(0, 0, 0, outH, outM);
    return (outDate.getTime() - inDate.getTime()) / 1000 / 60 / 60; 
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20
      );
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50) {
        setCurrentView(prev => (prev === 'pie' ? 'calendar' : 'pie'));
      } else if (gestureState.dx > 50) {
        setCurrentView(prev => (prev === 'calendar' ? 'pie' : 'calendar'));
      }
    },
  });

  const isLatePunchIn = (punchIn: string) => {
    if (!punchIn) return false;
    const [hours, minutes] = punchIn.split(':').map(Number);
    return hours > 10 || (hours === 10 && minutes > 15);
  };

  const isAfter830 = (punchIn: string) => {
    if (!punchIn) return false;
    const [hours, minutes] = punchIn.split(':').map(Number);
    return hours > 8 || (hours === 8 && minutes > 30);
  };

  const isBefore830 = (punchIn: string) => {
    if (!punchIn) return false;
    const [hours, minutes] = punchIn.split(':').map(Number);
    return hours < 8 || (hours === 8 && minutes < 30);
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
        const final = parsed?.d ? JSON.parse(parsed?.d) : parsed;
        setListData(final?.data || final || []);
      } catch (e: any) {
        setParsedError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (fromDate && toDate) fetchListData(fromDate, toDate);
  }, [fromDate, toDate, fetchListData]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const storedLink = await AsyncStorage.getItem('erp_link');
        if (isMounted) {
          let normalizedBase = (storedLink || '').replace(/\/+$/, '');
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

  let data = listData.length > 0 ? [...listData] : [];
  if (activeFilter !== 'all') {
    switch (activeFilter) {
      case 'leave':
        data = data.filter(i => i.status?.toLowerCase() === 'leave');
        break;
      case 'leave_first_half':
        data = data.filter(i => i.status?.toLowerCase() === 'leave_first_half');
        break;
      case 'leave_second_half':
        data = data.filter(i => i.status?.toLowerCase() === 'leave_second_half');
        break;
      case 'late':
        data = data.filter(i => i.intime && isLatePunchIn(i.intime));
        break;
      case 'after_830':
        data = data.filter(i => i.intime && isAfter830(i.intime));
        break;
      case 'before_830':
        data = data.filter(i => i.intime && isBefore830(i.intime));
        break;
    }
  }

  const total = listData.length;
  const leave = listData.filter(i => i.status?.toLowerCase() === 'leave').length;
  const late = listData.filter(i => i.intime && isLatePunchIn(i.intime)).length;
  const lessHours = listData.filter(
    i => i.intime && i.outtime && getWorkedHours(i.intime, i.outtime) < 8.5,
  ).length;
  const present = total - leave;

  const chartData = [
    { value: present, color: '#4caf50', text: 'Present' },
    { value: leave, color: '#f44336', text: 'Leave' },
    { value: late, color: '#a6bfc9ff', text: 'Late' },
    { value: lessHours, color: '#ff9800', text: 'Less Hrs' },
  ];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (parsedError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{JSON.stringify(parsedError)}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {showFilter && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          contentContainerStyle={{ alignItems: 'center', gap: 6 }}
        >
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 4, borderWidth: 1 },
                activeFilter === filter.key
                  ? { backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR, borderColor: '#fff' }
                  : { backgroundColor: '#fff', borderColor: '#ccc' },
              ]}
            >
              <Text
                style={{ color: activeFilter === filter.key ? '#fff' : '#000', fontWeight: '600' }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={['calendar']}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <>
            <View
              {...panResponder.panHandlers}
              style={{
                flex: 1,
                height: 350,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              {currentView === 'pie' && listData.length > 0 && (
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
                      <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
                        {total + `\n`}Days
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

              {currentView === 'calendar' && (
                <>
                  <View
                    style={{
                      width: '100%',
                      alignItems: 'center',
                      marginVertical: 12,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}
                  >
                    <Text>Current month</Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                        day,
                      ).padStart(2, '0')}`;
                      const dayData = listData.find(d => normalizeDate(d.date) === dateStr);

                      let bgColor = '#fff';
                      let textColor = '#000';

                      if (dayData) {
                        if (dayData.status?.toLowerCase() === 'leave') {
                          bgColor = '#f44336';
                          textColor = '#fff';
                        }
                        if (dayData.status?.toLowerCase() === 'working') {
                          bgColor = '#ccc';
                          textColor = '#000';
                        } else if (
                          dayData.status?.toLowerCase() === 'leave_first_half' ||
                          dayData.status?.toLowerCase() === 'leave_second_half'
                        ) {
                          bgColor = '#ff9800';
                          textColor = '#fff';
                        } else {
                          bgColor = '#4caf50';
                          textColor = '#fff';
                        }
                      }

                      return (
                        <TouchableOpacity
                          key={day}
                          style={{
                            width: '14.28%',
                            height: 60,

                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 0.5,
                            borderColor: '#ddd',
                            backgroundColor: bgColor,
                          }}
                          onPress={() =>
                            Alert.alert(
                              `Attendance on ${dateStr}`,
                              dayData ? JSON.stringify(dayData, null, 2) : 'No data',
                            )
                          }
                        >
                          <Text style={{ fontSize: 14, color: textColor }}>{day}</Text>
                          {dayData && (
                            <Text style={{ fontSize: 10, color: textColor, fontWeight: '600' }}>
                              {dayData.status}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginVertical: 10,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: currentView === 'pie' ? 24 : 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: currentView === 'pie' ? '#4caf50' : '#ccc',
                  }}
                />
                <View
                  style={{
                    width: currentView === 'calendar' ? 24 : 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: currentView === 'calendar' ? '#4caf50' : '#ccc',
                  }}
                />
              </View>
            </View>

            {/* List */}
            {isLoading ? (
              <FullViewLoader />
            ) : data.length === 0 ? (
              <View
                style={{
                  height: Dimensions.get('screen').height * 0.45,
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
                renderItem={({ item }) => {
                  const isLeaveFull = item.status?.toLowerCase() === 'leave';
                  const workedHours =
                    !item.intime || !item.outtime ? 0 : getWorkedHours(item.intime, item.outtime);
                  const isLessThanRequired = !isLeaveFull && workedHours < 8.5;
                  const isLate = !isLeaveFull && item.intime && isLatePunchIn(item.intime);

                  return (
                    <View
                      style={[
                        styles.recordCard,
                        {
                          backgroundColor:
                            item?.status?.toLowerCase() !== 'working' ? '#fff' : '#ccc',
                          opacity: item?.status?.toLowerCase() === 'working' ? 0.5 : 1,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.image && (
                          <Image
                            source={{ uri: baseLink + '/' + item.image }}
                            style={styles.recordAvatar}
                          />
                        )}
                        {item.image2 && (
                          <Image
                            source={{ uri: baseLink + '/' + item.image2 }}
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

                        {!isLeaveFull && (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons color="#666" size={14} name="hourglass-bottom" />
                              <Text style={styles.recordPunchTime}>{item?.intime || '--'}</Text>
                            </View>
                            {item?.status?.toLowerCase() !== 'working' && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialIcons color="#666" size={14} name="query-builder" />
                                <Text style={styles.recordPunchTime}>
                                  {(workedHours - 1).toFixed(2)} hr
                                </Text>
                              </View>
                            )}

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <MaterialIcons color="#666" size={14} name="hourglass-top" />
                              <Text style={styles.recordPunchTime}>{item?.outtime || '--'}</Text>
                            </View>
                          </View>
                        )}

                        {isLeaveFull && <Text style={styles.statusBadgeRed}>Leave</Text>}
                        {isLate && <Text style={styles.statusBadgeBlue}>Late</Text>}
                        {item?.status?.toLowerCase() !== 'working' && isLessThanRequired && (
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
