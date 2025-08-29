import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const AjaxPicker = ({ label, selectedValue, onValueChange, item, errors, dtext, formValues }: any) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
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
      const res = await dispatch(
        getAjaxThunk({
          dtlid: item?.dtlid,
          where: item?.ddlwhere,
          search: search,
        }),
      ).unwrap();
      setOptions(res?.data ?? []);
    } catch (e) {
      setOptions([]);
    }
  }, [dispatch, item?.dtlid, item?.ddlwhere, search]);

  const handleOpen = async () => {
    setOpen(true);
    await fetchOptions();
  };

  const handleSelect = (opt: any) => {
    console.log("🚀 ~ handleSelect ~ opt:", opt)
    if (item?.ddl) {
      const ddlParts = item.ddl.split('-');
      if (ddlParts.length > 1) {
        const fields = ddlParts[1].split(',');
        console.log("🚀 ~ handleSelect ~ fields:", fields)
        const mappedValues: Record<string, any> = {};
        fields.forEach((f) => {
          console.log("🚀 ~ handleSelect ~ f:", f)
          const key = f.toLowerCase(); 
          console.log("🚀 ~ handleSelect ~ key:", key)
          console.log("🚀 ~ handleSelect ~ key:", mappedValues[key] ,"---------", opt[f])
          mappedValues[key] = opt[key]; 
        });
        console.log("🚀 ~ handleSelect ~ mappedValues:-------", mappedValues)

        onValueChange(mappedValues);
      } else {
        onValueChange(opt?.value);
      }
    } else {
      onValueChange(opt?.value);
    }

    setSelectedOption(
      opt?.deptname || opt?.name || opt?.text || opt?.label || '',
    );
    setOpen(false);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Label */}
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && (
          <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>
        )}
      </View>

      {/* Trigger */}
      <TouchableOpacity
        style={[styles.pickerBox]}
        onPress={handleOpen}
        activeOpacity={0.7}>
        <Text style={{ color: selectedOption ? '#000' : '#888', flex: 1 }}>
          {formValues[label.toLowerCase()] || dtext || item?.text || 'Select...'}
        </Text>
        <MaterialIcons
          name={'arrow-drop-down'}
          size={24}
          color="#555"
        />
      </TouchableOpacity>

      {/* BottomSheet Modal */}
      <Modal visible={open} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}>
          <View
            style={{
              height: '75%',
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
            }}>
            {/* Header */}
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={[styles.textInput, { marginVertical: 12 }]}
              keyboardType={item.ctltype === 'NUMERIC' ? 'numeric' : 'default'}
              placeholder="Search here..."
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
            />

            {/* Options */}
            <ScrollView>
              {options.length > 0 ? (
                options.map((opt: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.option, { paddingVertical: 12 }]}
                    onPress={() => handleSelect(opt)}>
                    <View>
                      {Object.entries(opt).map(([key, value], idx) => {
                        if (key.toLowerCase().includes('id')) return null; // skip id fields
                        return (
                          <Text key={idx} style={{ fontSize: 14 }}>
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
                  }}>
                  <Text>No data</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Error */}
      {errors[item.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
          {errors[item.field]}
        </Text>
      )}
    </View>
  );
};

export default React.memo(AjaxPicker);
