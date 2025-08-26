import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

import { styles } from './attandance_style';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import ERPIcon from '../../../components/icon/ERPIcon';
import List from './components/List';
import AttandanceForm from './components/AttandanceForm';

const AttendanceScreen = () => {
  const navigation = useNavigation<any>();
  const [isListVisible, setIsListVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

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
              setIsListVisible(!isListVisible);
            }}
          />
          {isListVisible && (
            <ERPIcon
              name="filter-alt"
              onPress={() => {
                setShowFilter(!showFilter);
              }}
            />
          )}
          {isListVisible && (
            <ERPIcon
              name="date-range"
              onPress={() => {
                setShowPicker(!showPicker);
              }}
            />
          )}
          <ERPIcon name="refresh" />
        </>
      ),
    });
  }, [navigation, isListVisible, showPicker, showFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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
            <View style={{ padding: 16 }}>
              <AttandanceForm />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default AttendanceScreen;
