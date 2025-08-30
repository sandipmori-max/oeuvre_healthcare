import React, { useCallback, useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native';
import { useAppDispatch } from '../../../../store/hooks';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { getAjaxThunk } from '../../../../store/slices/ajax/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import FullViewLoader from '../../../../components/loader/FullViewLoader';

const AjaxPicker = ({
  label,
  onValueChange,
  item,
  errors,
  dtext,
  formValues,
}: any) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loader, setLoader] = useState(false);
  const dispatch = useAppDispatch();
  const [selectedOption, setSelectedOption] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        fetchOptions();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSelectedOption(dtext || item?.text || item?.value);
  }, [dtext, item]);

  const fetchOptions = useCallback(async () => {
    try {
      setLoader(true);
      const res = await dispatch(
        getAjaxThunk({
          dtlid: item?.dtlid,
          where: item?.ddlwhere,
          search: search,
        }),
      ).unwrap();
      setOptions(res?.data ?? []);
      setLoader(false);
    } catch (e) {
      setOptions([]);
      setLoader(false);
    }
  }, [dispatch, item?.dtlid, item?.ddlwhere, search]);

  const handleOpen = async () => {
    setOpen(true);
    await fetchOptions();
  };

  const handleSelect = (opt: any) => {
    if (item?.ddlfield) {

      const ddlParts = item.ddlfield.split(',');
      if (ddlParts.length > 1) {
        const mappedValues: Record<string, any> = {};
        ddlParts.forEach(f => {
          const key = f.toLowerCase();
          mappedValues[key] = opt[key];
        });

        onValueChange(mappedValues);
      } else {
        onValueChange(opt);
      }
    } else {
      onValueChange(opt);
    }

    setSelectedOption(opt?.deptname || opt?.name || opt?.text || opt?.label || '');
    setOpen(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>

      <TouchableOpacity style={[styles.pickerBox]} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={{ color: selectedOption ? '#000' : '#888', flex: 1 }}>
          {formValues[label.toLowerCase()] || dtext || item?.text || 'Select...'}
        </Text>
        <MaterialIcons name={'arrow-drop-down'} size={24} color="#555" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View
            style={{
              height: '75%',
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={{ position: 'relative', marginVertical: 12 }}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                placeholder="Search here..."
                placeholderTextColor="#888"
                value={search}
                onChangeText={setSearch}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: [{ translateY: -12 }],
                  }}
                >
                  <MaterialIcons name="close" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {loader ? (
              <FullViewLoader />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.length > 0 ? (
                  options.map((opt: any, i: number) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.option, { paddingVertical: 12 }]}
                      onPress={() => handleSelect(opt)}
                    >
                      <View>
                        {Object.entries(opt).map(([key, value], idx) => {
                          if (key.toLowerCase().includes('id')) return null;
                          return (
                            <Text
                              key={idx}
                              style={{
                                color: key === label.toLowerCase() ? ERP_COLOR_CODE.ERP_APP_COLOR : '#000',
                                fontSize: key === label.toLowerCase() ? 16 : 14,
                                fontWeight: key === label.toLowerCase() ? '700' : '400'
                              }}
                            >
                            {String(value)}
                            </Text>
                          );
                        })}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View
                    style={{
                      marginVertical: 12,
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 100,
                    }}
                  >
                    <Text>No data</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {errors[item.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>{errors[item.field]}</Text>
      )}
    </View>
  );
};

export default React.memo(AjaxPicker);
