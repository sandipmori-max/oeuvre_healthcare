import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  SectionList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import NoData from '../../../../components/no_data/NoData';
import { PieChart } from 'react-native-gifted-charts';
import { ERP_COLOR_CODE } from '../../../../utils/constants';

const dummyAttendanceList = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-06-10 08:30 AM',
    punch_in: '08:25 AM',
    punch_out: '05:00 PM',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-06-11 08:40 AM',
    punch_in: '08:38 AM',
    punch_out: '05:05 PM',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-07-05 08:45 AM',
    punch_in: '08:43 AM',
    punch_out: '05:10 PM',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  },
  {
    id: '4',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-07-06 08:35 AM',
    punch_in: '08:30 AM',
    punch_out: '05:15 PM',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  },
  {
    id: '5',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-07-07 08:50 AM',
    punch_in: '08:45 AM',
    punch_out: '05:20 PM',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  },
  {
    id: '100',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-01 08:30 AM',
    punch_in: '08:25 AM',
    punch_out: '05:00 PM',
  },
  {
    id: '101',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-02 08:30 AM',
    punch_in: '10:16 AM',
    punch_out: '05:10 PM',
  },
  {
    id: '102',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-03 08:30 AM',
    punch_in: '',
    punch_out: '',
    status: 'leave',
  },
  {
    id: '103',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-04 08:30 AM',
    punch_in: '10:16 AM',
    punch_out: '08:10 PM',
  },
  {
    id: '104',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-05 08:30 AM',
    punch_in: '08:20 AM',
    punch_out: '05:05 PM',
  },
  {
    id: '105',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-06 08:30 AM',
    punch_in: '01:30 PM',
    punch_out: '05:30 PM',
    status: 'leave_first_half',
  },
  {
    id: '106',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-07 08:30 AM',
    punch_in: '08:40 AM',
    punch_out: '05:00 PM',
  },
  {
    id: '107',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-08 08:30 AM',
    punch_in: '08:45 AM',
    punch_out: '12:00 PM',
    status: 'leave_second_half',
  },
  {
    id: '108',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-09 08:30 AM',
    punch_in: '08:30 AM',
    punch_out: '05:00 PM',
  },
  {
    id: '109',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-10 08:30 AM',
    punch_in: '08:50 AM',
    punch_out: '05:30 PM',
  },
  {
    id: '110',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-11 08:30 AM',
    punch_in: '',
    punch_out: '',
    status: 'leave',
  },
  {
    id: '111',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-12 08:30 AM',
    punch_in: '09:15 AM',
    punch_out: '06:00 PM',
  },
  {
    id: '112',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-13 08:30 AM',
    punch_in: '08:35 AM',
    punch_out: '05:00 PM',
  },
  {
    id: '113',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-14 08:30 AM',
    punch_in: '08:20 AM',
    punch_out: '05:15 PM',
  },
  {
    id: '114',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-15 08:30 AM',
    punch_in: '08:55 AM',
    punch_out: '05:30 PM',
  },
  {
    id: '115',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-16 08:30 AM',
    punch_in: '08:45 AM',
    punch_out: '04:50 PM',
  },
  {
    id: '116',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-17 08:30 AM',
    punch_in: '',
    punch_out: '',
    status: 'leave',
  },
  {
    id: '117',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-18 08:30 AM',
    punch_in: '08:25 AM',
    punch_out: '05:00 PM',
  },
  {
    id: '118',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-19 08:30 AM',
    punch_in: '08:30 AM',
    punch_out: '05:10 PM',
  },
  {
    id: '119',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-20 08:30 AM',
    punch_in: '01:30 PM',
    punch_out: '05:00 PM',
    status: 'leave_first_half',
  },
  {
    id: '120',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-21 08:30 AM',
    punch_in: '10:30 AM',
    punch_out: '08:00 PM',
  },
  {
    id: '121',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-22 08:30 AM',
    punch_in: '10:16 AM',
    punch_out: '05:10 PM',
  },
  {
    id: '122',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-23 08:30 AM',
    punch_in: '08:50 AM',
    punch_out: '05:05 PM',
  },
  {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-24 08:30 AM',
    punch_in: '08:45 AM',
    punch_out: '05:10 PM',
  },
  {
    id: '124',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-25 08:30 AM',
    punch_in: '08:45 AM',
    punch_out: '05:20 PM',
  },
  {
    id: '125',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-26 08:30 AM',
    punch_in: '',
    punch_out: '',
    status: 'leave',
  },
  {
    id: '126',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-27 08:30 AM',
    punch_in: '01:30 PM',
    punch_out: '05:00 PM',
    status: 'leave_first_half',
  },
  {
    id: '127',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-28 08:30 AM',
    punch_in: '08:45 AM',
    punch_out: '12:00 PM',
    status: 'leave_second_half',
  },
  {
    id: '128',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-29 08:30 AM',
    punch_in: '08:15 AM',
    punch_out: '05:00 PM',
  },
  {
    id: '129',
    name: 'John Doe',
    email: 'john@example.com',
    dateTime: '2025-08-30 08:30 AM',
    punch_in: '09:00 AM',
    punch_out: '05:45 PM',
  },
];
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'leave', label: 'Leave' },
  { key: 'leave_first_half', label: 'First Half' },
  { key: 'leave_second_half', label: 'Second Half' },
  { key: 'late', label: 'Late Entry' },
  { key: 'after_830', label: '8:30 >' },
  { key: 'before_8301', label: '8:30 <' },
];
const styles = StyleSheet.create({
  listSection: { flex: 1, paddingHorizontal: 16 },
  sectionHeader: {
    padding: 8,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    alignItems: 'center',
  },
  recordAvatar: { width: 50, height: 50, borderRadius: 25 },
  recordName: { fontWeight: '600', fontSize: 16 },
  recordDateTime: { fontSize: 12, color: '#666' },
  recordPunchTime: { fontSize: 14, color: '#333' },
  lateCountContainer: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#913737ff',
  },
  lateCountText: {
    color: '#913737ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
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
  statusBadgeOrange: {
    backgroundColor: '#b68f85ff',
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

const List = ({ selectedMonth, showFilter }: any) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const parseDateTime = (dateTimeStr: string) => {
    const [datePart, timePart, ampm] = dateTimeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return new Date(
      `${datePart}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`,
    );
  };

  const groupByMonth = (data: any[]) => {
    const grouped: Record<string, any[]> = {};
    data.forEach(item => {
      const date = parseDateTime(item.dateTime);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(item);
    });
    return grouped;
  };

  const getWorkedHours = (punchIn: string, punchOut: string): number => {
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const inTime = parseTime(punchIn);
    const outTime = parseTime(punchOut);
    const inDate = new Date(0, 0, 0, inTime.hours, inTime.minutes);
    const outDate = new Date(0, 0, 0, outTime.hours, outTime.minutes);
    const diffMs = outDate.getTime() - inDate.getTime();
    return diffMs / 1000 / 60 / 60;
  };

  const isLatePunchIn = (punchIn: string): boolean => {
    if (!punchIn) return false;
    const [time, modifier] = punchIn.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours > 10 || (hours === 10 && minutes > 15);
  };

  const isAfter830 = (punchIn: string) => {
    if (!punchIn) return false;
    const [time, modifier] = punchIn.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    if (hours > 8) return true;
    if (hours === 8 && minutes > 30) return true;
    return false;
  };

  const isBefore830 = (punchIn: string) => {
    if (!punchIn) return false;
    const [time, modifier] = punchIn.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    if (hours < 8) return true;
    if (hours === 8 && minutes < 30) return true;
    return false;
  };

  const groupedAttendance = groupByMonth(dummyAttendanceList);
  let data = groupedAttendance[selectedMonth] || [];

  if (activeFilter !== 'all') {
    switch (activeFilter) {
      case 'leave':
        data = data.filter(item => item.status === 'leave');
        break;
      case 'leave_first_half':
        data = data.filter(item => item.status === 'leave_first_half');
        break;
      case 'leave_second_half':
        data = data.filter(item => item.status === 'leave_second_half');
        break;
      case 'late':
        data = data.filter(
          item =>
            item.punch_in &&
            isLatePunchIn(item.punch_in) &&
            item.status !== 'leave' &&
            item.status !== 'leave_first_half' &&
            item.status !== 'leave_second_half',
        );
        break;
      case 'after_830':
        data = data.filter(
          item =>
            item.punch_in &&
            isAfter830(item.punch_in) &&
            item.status !== 'leave' &&
            item.status !== 'leave_first_half' &&
            item.status !== 'leave_second_half',
        );
        break;
      case 'before_830':
        data = data.filter(
          item =>
            item.punch_in &&
            isBefore830(item.punch_in) &&
            item.status !== 'leave' &&
            item.status !== 'leave_first_half' &&
            item.status !== 'leave_second_half',
        );
        break;
      default:
        break;
    }
  }

  const lateEntries = data.filter(
    item =>
      item.punch_in &&
      isLatePunchIn(item.punch_in) &&
      item.status !== 'leave' &&
      item.status !== 'leave_first_half' &&
      item.status !== 'leave_second_half',
  );
  const lateCount = lateEntries.length;
  const leaveFullCount = data.filter(item => item.status === 'leave').length;
  const leaveFirstHalfCount = data.filter(item => item.status === 'leave_first_half').length;
  const leaveSecondHalfCount = data.filter(item => item.status === 'leave_second_half').length;

  const totalLeaveDays = leaveFullCount + (leaveFirstHalfCount + leaveSecondHalfCount) * 0.5;
  const totalPresent = data.filter(
    item =>
      item.status !== 'leave' &&
      item.status !== 'leave_first_half' &&
      item.status !== 'leave_second_half',
  ).length;
  const chartData = [
    {
      value: totalPresent,
      color: '#237434ff',
      text: `${totalPresent}`,
      title: `Present ${totalPresent}`,
    },
    {
      value: leaveFullCount,
      color: '#f72525ff',
      text: `${leaveFullCount}`,
      title: `Leave ${leaveFullCount}`,
    },
    {
      value: leaveFirstHalfCount + leaveSecondHalfCount,
      color: '#b68f85ff',
      text: `F:${leaveFirstHalfCount}/S:${leaveSecondHalfCount}`,
      title: `HL ${leaveFirstHalfCount}/${leaveSecondHalfCount}`,
    },
    {
      value: lateCount,
      color: '#f39191ff',
      text: `${lateCount}`,
      title: `Late ${lateCount}`,
    },
  ];
  return (
    <View style={{ flex: 1 }}>
      <View>
        {showFilter && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f0f0f0' }}
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
            <View style={{ width: 10 }} />
          </ScrollView>
        )}
      </View>

      <FlatList
        data={['']}
        showsVerticalScrollIndicator={false}
        renderItem={() => {
          return (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomColor: '#ccc',
                  borderBottomWidth: 1,
                  paddingBottom: 18,
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  paddingTop: 16,
                }}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <PieChart
                    data={chartData}
                    donut
                    radius={90}
                    textSize={14}
                    innerRadius={50}
                    showValuesAsLabels
                    labelPosition="outside"
                    innerCircleColor="#fff"
                    centerLabelComponent={() => {
                      return (
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#000',
                          }}
                        >
                          Total{'\n'}
                          {totalPresent +
                            leaveFullCount +
                            leaveFirstHalfCount +
                            leaveSecondHalfCount}
                        </Text>
                      );
                    }}
                  />
                </View>
                <View style={{ margin: 16, justifyContent: 'center', alignContent: 'center' }}>
                  {chartData.map((item, idx) => (
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
                      <Text style={{ fontSize: 14, color: '#444' }}>{item.title}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.listSection}>
                {data.length === 0 ? (
                  <NoData />
                ) : (
                  <SectionList
                    sections={[{ title: selectedMonth, data }]}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section: { title } }) => (
                      <View
                        style={{
                          alignItems: 'center',
                          paddingHorizontal: 18,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <MaterialIcons color={'#000'} size={14} name="arrow-back-ios" />
                        <Text style={styles.sectionHeader}>{title}</Text>
                        <MaterialIcons color={'#000'} size={14} name="arrow-forward-ios" />
                      </View>
                    )}
                    renderItem={({ item }) => {
                      const isLeaveFull = item.status === 'leave';
                      const isLeaveFirstHalf = item.status === 'leave_first_half';
                      const isLeaveSecondHalf = item.status === 'leave_second_half';
                      const isHalfDayLeave = isLeaveFirstHalf || isLeaveSecondHalf;

                      const workedHours =
                        isLeaveFull || !item.punch_in || !item.punch_out
                          ? 0
                          : getWorkedHours(item.punch_in, item.punch_out);
                      const isLessThanRequired =
                        !isLeaveFull && !isHalfDayLeave && workedHours < 8.5;
                      const isLate =
                        item.status !== 'leave' &&
                        item.status !== 'leave_first_half' &&
                        item.status !== 'leave_second_half' &&
                        isLatePunchIn(item.punch_in);

                      const remainingHours = isLessThanRequired ? 8.5 - workedHours : 0;
                      const remainingH = Math.floor(remainingHours);
                      const remainingM = Math.round((remainingHours - remainingH) * 60);
                      const remainingFormatted = `${remainingH}h ${remainingM}m`;
                      const isLateAndLessHours = isLate && isLessThanRequired;

                      return (
                        <View style={[styles.recordCard]}>
                          <Image
                            source={{
                              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
                            }}
                            style={styles.recordAvatar}
                          />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 4,
                              }}
                            >
                              <Text style={[styles.recordName]}>{item.name}</Text>
                              <Text style={[styles.recordDateTime]}>{item.dateTime}</Text>
                            </View>

                            {/* Leave Info */}
                            <>
                              {/* Punch Times */}
                              {!isLeaveFull && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <View
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                  >
                                    <MaterialIcons color={'#666'} size={14} name="punch-clock" />
                                    <Text style={styles.recordPunchTime}>{item.punch_in}</Text>
                                  </View>

                                  <View
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                  >
                                    <MaterialIcons color={'#666'} size={14} name="punch-clock" />
                                    <Text style={styles.recordPunchTime}>{item.punch_out}</Text>
                                  </View>
                                </View>
                              )}

                              {isLeaveFull && <Text style={styles.statusBadgeRed}>Leave</Text>}
                              {isLeaveFirstHalf && (
                                <Text style={styles.statusBadgeOrange}>First Half</Text>
                              )}
                              {isLeaveSecondHalf && (
                                <Text style={styles.statusBadgeOrange}>Second Half</Text>
                              )}
                              {isLate && !isLeaveFull && !isHalfDayLeave && (
                                <Text style={styles.statusBadgeBlue}>Late</Text>
                              )}
                              {isLessThanRequired && !isLeaveFull && !isHalfDayLeave && (
                                <View
                                  style={[
                                    {
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      alignContent: 'center',
                                    },
                                    styles.statusBadgeGrey,
                                  ]}
                                >
                                  <Text>Less Hours</Text>
                                  {isLessThanRequired && !isHalfDayLeave && (
                                    <Text style={{ color: '#913737', fontWeight: 'bold' }}>
                                      {remainingFormatted}
                                    </Text>
                                  )}
                                </View>
                              )}
                            </>
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
              </View>
            </>
          );
        }}
      />
    </View>
  );
};

export default List;
