import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Button,
  TouchableOpacity,
} from 'react-native';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const { height: screenHeight } = Dimensions.get('window');

const AddData = ({ configData, setIsVisibleFormData, isVisibleFormData, pageTitle }) => {
  const [translateY] = useState(new Animated.Value(screenHeight));
  const [formValues, setFormValues] = useState({});
  console.log("🚀 ~ AddData ~ formValues:", formValues)

  const heightRatio = 0.88;

  useEffect(() => {
    if (isVisibleFormData) {
      Animated.timing(translateY, {
        toValue: screenHeight * (1 - heightRatio),
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisibleFormData]);

  const handleChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const renderField = field => {
    const { datafield, headertext, dataformatstring } = field;

    if (dataformatstring.includes('D')) {
      return (
        <View key={datafield} style={styles.fieldContainer}>
          <Text style={styles.label}>{headertext}</Text>
        </View>
      );
    }

    if (datafield === 'Gender') {
      return (
        <View key={datafield} style={styles.fieldContainer}>
          <Text style={styles.label}>{headertext}</Text>
        </View>
      );
    }

    return (
      <View key={datafield} style={styles.fieldContainer}>
        <Text style={styles.label}>{headertext}</Text>
        <TextInput
          style={styles.input}
          value={formValues[datafield] || ''}
          onChangeText={value => handleChange(datafield, value)}
          placeholder={`Enter ${headertext.toLowerCase()}`}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Modal
        visible={isVisibleFormData}
        transparent
        animationType="none"
        onRequestClose={() => setIsVisibleFormData(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setIsVisibleFormData(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handle}/>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 6,
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{fontSize: 16, fontWeight: '600'}}>{pageTitle}</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsVisibleFormData(false);
                }}
              >
                <MaterialIcons name={'close'} color={'#000'} size={24} />
              </TouchableOpacity>
            </View>

            <View style={{ height: '80%' }}>
              <FlatList
                showsVerticalScrollIndicator={false}
                data={configData}
                renderItem={({ item }) => renderField(item)}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
              />
              <TouchableOpacity
                style={[styles.saveButton, false && styles.disabledButton]}
                //    onPress={() => handleSubmit()}
                //    disabled={loader}
              >
                {/* {loader ? (
                                 <Text style={styles.addButtonText}>Account adding...</Text>
                               ) : (
                                 <Text style={styles.addButtonText}>Add Account</Text>
                               )} */}
                <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default AddData;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  saveButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    margin: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    opacity: 0.5,
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginVertical: 8,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 6,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
});
