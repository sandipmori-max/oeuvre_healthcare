import React, { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { styles } from './display_style';
import LeaveApplyForm from './components/LeaveApplyForm';
import LeaveListPage from './components/LeaveList';
import ERPIcon from '../../../components/icon/ERPIcon';
import { useNavigation } from '@react-navigation/native';
import LeaveDetailsBottomSheet from './components/LeaveDetails';

const DisplayScreen = () => {
  const navigation = useNavigation<any>();

  const [isListVisible, setIsListVisible] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon
            name={!isListVisible ? 'list' : 'post-add'}
            onPress={() => {
              if (showDetails) {
                return;
              }
              setIsListVisible(!isListVisible);
            }}
          />
          {isListVisible && (
            <ERPIcon
              name="filter-alt"
              onPress={() => {
                if (showDetails) {
                  return;
                }
                setShowFilter(!showFilter);
              }}
            />
          )}
          {isListVisible && (
            <ERPIcon
              name="date-range"
              onPress={() => {
                if (showDetails) {
                  return;
                }
                setShowPicker(!showPicker);
              }}
            />
          )}
          <ERPIcon name="refresh" />
        </>
      ),
    });
  }, [navigation, isListVisible, showPicker, showFilter, showDetails]);

  return (
    <View style={styles.container}>
      {isListVisible ? (
        <LeaveListPage
          showFilter={showFilter}
          onSelect={(leave: any) => {
            setSelectedLeave(leave);
            setShowDetails(true);
          }}
        />
      ) : (
        <LeaveApplyForm />
      )}

      <LeaveDetailsBottomSheet
        visible={showDetails}
        leave={selectedLeave}
        onClose={() => setShowDetails(false)}
      />
    </View>
  );
};

export default DisplayScreen;
