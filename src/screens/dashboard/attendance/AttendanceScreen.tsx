import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

import { styles } from './attendance_style';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import ERPIcon from '../../../components/icon/ERPIcon';
import List from './components/List';
import AttendanceForm from './components/AttendanceForm';
import { useAppDispatch } from '../../../store/hooks';
import { getLastPunchInThunk } from '../../../store/slices/attendance/thunk';

const AttendanceScreen = () => {
  const navigation = useNavigation<any>();
  const [isListVisible, setIsListVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const [resData, setResData] = useState<any>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [blockAction, setBlockAction] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [actionLoader, setActionLoader] = useState(false);

  const formattedMonth = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`;

  const onChangeDate = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon
            name={!isListVisible ? 'list' : 'post-add'}
            onPress={() => {
              if (!blockAction) {
                setIsListVisible(!isListVisible);
              }
            }}
          />
          {isListVisible && (
            <ERPIcon
              name="filter-alt"
              onPress={() => {
                if (!blockAction) {
                  setShowFilter(!showFilter);
                }
              }}
            />
          )}
          {isListVisible && (
            <ERPIcon
              name="date-range"
              onPress={() => {
                if (!blockAction) {
                  setShowPicker(!showPicker);
                }
              }}
            />
          )}
          <ERPIcon
            isLoading={actionLoader}
            name="refresh"
            onPress={() => {
              setRefresh(!refresh);
              setActionLoader(!actionLoader);
            }}
          />
        </>
      ),
    });
  }, [navigation, isListVisible, showPicker, showFilter, blockAction, refresh, actionLoader]);

  const checkAttendance = () => {
    setIsLoading(true);
    dispatch(getLastPunchInThunk())
      .unwrap()
      .then(res => {
        console.log('✅ Last Punch-In Response:', res);
        setResData(res);
        setIsLoading(false);
        setActionLoader(false);
      })
      .catch(err => {
        setIsLoading(false);
        setActionLoader(false);

        console.log('❌ Error fetching last punch-in:', err);
      });
  };
  useEffect(() => {
    checkAttendance();
  }, [dispatch, refresh]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <FullViewLoader />
      ) : (
        <>
          {isListVisible ? (
            <View style={{ flex: 1 }}>
              <List selectedMonth={formattedMonth} showFilter={showFilter} />
              {showPicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeDate}
                />
              )}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <AttendanceForm setBlockAction={setBlockAction} resData={resData} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default AttendanceScreen;
