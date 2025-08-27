/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getERPPageThunk } from '../../../store/slices/auth/thunk';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import NoData from '../../../components/no_data/NoData';
import ErrorMessage from '../../../components/error/Error';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ERPIcon from '../../../components/icon/ERPIcon';
import { ERP_COLOR_CODE } from '../../../utils/constants';
import { getDDLThunk } from '../../../store/slices/dropdown/thunk';
import { getAjaxThunk } from '../../../store/slices/ajax/thunk';
import { resetAjaxState } from '../../../store/slices/ajax/ajaxSlice';
import { resetDropdownState } from '../../../store/slices/dropdown/dropdownSlice';
import { savePageThunk } from '../../../store/slices/page/thunk';

type PageRouteParams = { PageScreen: { item: any } };

const ErrorModal = ({
  visible,
  errors,
  onClose,
}: {
  visible: boolean;
  errors: string[];
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.bottomSheet}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={styles.title}>Please fix the following errors:</Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
              }}
            >
              <MaterialIcons name={'close'} size={20} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={{ marginVertical: 14 }}>
            <FlatList
              data={errors}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => <Text style={styles.errorText}>• {item}</Text>}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CustomPicker = ({ label, selectedValue, onValueChange, options, item }: any) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const {
    loading: ajxLoader,
    error: ajaxError,
    response: ajaxResponse,
  } = useAppSelector(state => state.ajax);
  console.log('🚀 ~ CustomPicker ~ ajaxResponse:', ajaxResponse);
  console.log('🚀 ~ CustomPicker ~ ajaxError:', ajaxError);
  console.log('🚀 ~ CustomPicker ~ ajxLoader:', ajxLoader);
  const {
    loading: dropDownLoader,
    error: dropDownError,
    response: dropDownResponse,
  } = useAppSelector(state => state.dropdown);
  console.log('🚀 ~ CustomPicker ~ dropDownResponse:', dropDownResponse);
  console.log('🚀 ~ CustomPicker ~ dropDownError:', dropDownError);
  console.log('🚀 ~ CustomPicker ~ dropDownLoader:', dropDownLoader);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>
      <TouchableOpacity
        style={[styles.pickerBox]}
        onPress={() => {
          if (item?.ajax === '1') {
            dispatch(resetAjaxState());
            dispatch(getAjaxThunk({ dtlid: item?.dtlid, ddlwhere: item?.ddlwhere }));
          } else {
            dispatch(resetDropdownState());
            dispatch(getDDLThunk({ dtlid: item?.dtlid, ddlwhere: item?.ddlwhere }));
          }
          setOpen(!open);
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: selectedValue ? '#000' : '#888', flex: 1 }}>
          {selectedValue || 'Select...'}
        </Text>
        <MaterialIcons name={open ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color="#555" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownCard}>
          {item?.ajax === '1' && (
            <>
              <TextInput
                style={[styles.textInput, { margin: 4 }]}
                value={''}
                onChangeText={e => {}}
                keyboardType={item.ctltype === 'NUMERIC' ? 'numeric' : 'default'}
                placeholder="Search here....."
                placeholderTextColor="#888"
              />
            </>
          )}
          {options.length > 0 ? (
            <>
              {options.map((opt: any, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={styles.option}
                  onPress={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Text>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <View
                style={{
                  marginVertical: 12,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  height: 100,
                }}
              >
                <Text>No data</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const PageScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, error: errorPage, response } = useAppSelector(state => state.page);
  console.log('🚀 ~ PageScreen ~ response:', response);
  console.log('🚀 ~ PageScreen ~ errorPage:', errorPage);
  console.log('🚀 ~ PageScreen ~ loading:', loading);
  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const [controls, setControls] = useState<any[]>([]);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const route = useRoute<RouteProp<PageRouteParams, 'PageScreen'>>();
  const { item, title, id }: any = route.params;
  const validateForm = () => {
    const validationErrors: Record<string, string> = {};
    const errorMessages: string[] = [];

    controls?.forEach(item => {
      if (item.mandatory === '1' && !formValues[item.field]) {
        validationErrors[item.field] = `${item.fieldtitle || item.field} is required`;
        errorMessages.push(`${item.fieldtitle || item.field} is required`);
      }
    });

    setErrors(validationErrors);
    setErrorsList(errorMessages);

    if (errorMessages.length > 0) {
      setShowErrorModal(true);
    }

    return errorMessages.length === 0;
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          numberOfLines={1}
          style={{
            maxWidth: 180,
            fontSize: 18,
            fontWeight: '700',
            color: '#fff',
          }}
        >
          {item?.name || 'Details'}
        </Text>
      ),
      headerRight: () => (
        <>
          <ERPIcon
            name={'save-as'}
            onPress={() => {
              if (validateForm()) {
                const submitValues: Record<string, any> = {};
                controls.forEach(f => {
                  if (f.refcol !== '1') {
                    submitValues[f.field] = formValues[f.field];
                  }
                });
                dispatch(
                  savePageThunk({
                    page: title,
                    id: id,
                    data: {
                      ...submitValues,
                    },
                  }),
                );
              } else {
                console.log('❌ Validation failed');
              }
            }}
          />
          <ERPIcon
            name="refresh"
            onPress={() => {
              fetchPageData();
              setErrors({});
              setErrorsList([]);
            }}
          />
        </>
      ),
    });
  }, [navigation, item, id, formValues, loadingPageId]);

  const showDatePicker = (field: string) => {
    setActiveDateField(field);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setActiveDateField(null);
  };

  const handleConfirm = (date: Date) => {
    if (activeDateField) {
      setFormValues(prev => ({
        ...prev,
        [activeDateField]: date.toISOString(),
      }));
    }
    hideDatePicker();
  };
  const fetchPageData = async () => {
    try {
      setError(null);
      setLoadingPageId(id);

      const parsed = await dispatch(getERPPageThunk({ page: title, id })).unwrap();
      console.log('🚀 ~ fetchPageData ~ parsed:', parsed);

      const pageControls = Array.isArray(parsed?.pagectl) ? parsed.pagectl : [];
      setControls(pageControls);

      const initVals: any = {};
      pageControls.forEach(c => {
        initVals[c.field] = c.text || '';
      });
      setFormValues(initVals);
    } catch (e: any) {
      console.log('Failed to load page:', e);
      setError(e?.message || 'Failed to load page');
    } finally {
      setLoadingPageId(null);
    }
  };
  useEffect(() => {
    fetchPageData();
  }, [item, route]);

  const renderItem = ({ item }: { item: any }) => {
    const value = formValues[item.field] || '';
    const setValue = (val: string) => {
      setFormValues(prev => ({ ...prev, [item.field]: val }));
      setErrors(prev => ({ ...prev, [item.field]: '' }));
    };

    if (item?.visible === '1') return null;
    if (item.field === 'IMAGE') {
      return (
        <View
          style={{
            width: '100%',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 4,
          }}
        >
          <Image
            key={item.field}
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
            }}
            style={{ borderWidth: 1, width: 100, height: 100, borderRadius: 80 }}
          />
          <View
            style={{
              height: 36,
              width: 36,
              borderRadius: 36,
              backgroundColor: '#fff',
              position: 'absolute',
              bottom: 0,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              left: Dimensions.get('screen').width / 2,
              borderWidth: 1,
            }}
          >
            <MaterialIcons name={'edit'} color={'#000'} size={20} />
          </View>
        </View>
      );
    }

    if (item.disabled === '1') {
      return (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.label}>{item.fieldtitle}</Text>
            {item?.fieldtitle !== item?.tooltip && <Text> - ( {item.tooltip} )</Text>}
            {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
          </View>
          <View style={styles.disabledBox}>
            <Text style={{ color: '#555' }}>{value || '-'}</Text>
          </View>
        </View>
      );
    }

    if (item.ddl && item.ddl !== '') {
      return (
        <View style={{ marginBottom: 0 }}>
          <CustomPicker
            label={item.fieldtitle}
            selectedValue={value}
            onValueChange={setValue}
            options={item.options || []}
            item={item}
          />
          {errors[item.field] && (
            <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
              {errors[item.field]}
            </Text>
          )}
        </View>
      );
    }

    if (item.ctltype === 'DATE') {
      return (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.label}>{item.fieldtitle}</Text>
            {item?.fieldtitle !== item?.tooltip && <Text> - ( {item.tooltip} )</Text>}
            {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
          </View>
          <TouchableOpacity
            style={[
              styles.dateBox,
              errors[item.field] && { borderColor: ERP_COLOR_CODE.ERP_ERROR },
            ]}
            onPress={() => showDatePicker(item.field)}
          >
            <Text style={{ color: value ? '#000' : '#888' }}>
              {value ? value.split(' ')[0] : 'Select Date'}
            </Text>
            <MaterialIcons name="event" size={20} color="#555" />
          </TouchableOpacity>
          {errors[item.field] && (
            <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
              {errors[item.field]}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.label}>{item.fieldtitle}</Text>
          {item?.fieldtitle !== item?.tooltip && <Text> - ( {item.tooltip} )</Text>}
          {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
        </View>
        <TextInput
          style={[
            styles.textInput,
            errors[item.field] && { borderColor: ERP_COLOR_CODE.ERP_ERROR },
          ]}
          value={value}
          onChangeText={setValue}
          placeholder="Enter value"
        />
        {errors[item.field] && (
          <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
            {errors[item.field]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
      {loadingPageId ? (
        <FullViewLoader />
      ) : !!error ? (
        <ErrorMessage message={error} />
      ) : controls.length > 0 ? (
        <>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={controls}
            keyExtractor={(item, index) => item.dtlid || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </>
      ) : (
        <NoData />
      )}
      <ErrorModal
        visible={showErrorModal}
        errors={errorsList}
        onClose={() => setShowErrorModal(false)}
      />
      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default PageScreen;

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  disabledBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f1f1f1',
  },
  dateBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    marginVertical: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: ERP_COLOR_CODE.ERP_ERROR,
    marginBottom: 6,
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
