import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { useAppDispatch } from '../../../../store/hooks';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { getAjaxThunk } from '../../../../store/slices/ajax/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const AjaxPicker = ({ label, selectedValue, onValueChange, item, errors, dtext }: any) => {
  console.log('🚀 ~ AjaxPicker ~ item:', item);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [search, setSearch] = useState('');
  const dispatch = useAppDispatch();

  useEffect(() => {
    setSelectedOption(dtext);
  }, [dtext]);

  const fetchOptions = useCallback(
    async (query: string = '') => {
      try {
        const res = await dispatch(
          getAjaxThunk({
            dtlid: item?.dtlid,
            where: item?.ddlwhere,
            search: query,
          }),
        ).unwrap();
        setOptions(res?.data ?? []);
      } catch (e) {
        setOptions([]);
      }
    },
    [dispatch, item?.dtlid, item?.ddlwhere],
  );

  const handleOpen = useCallback(() => {
    fetchOptions('');
    setSearch('');
    setOpen(true);
  }, [fetchOptions]);

  useEffect(() => {
    if (!open) return;
    const handler = setTimeout(() => {
      fetchOptions(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, open, fetchOptions]);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>

      <TouchableOpacity style={[styles.pickerBox]} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={{ color: selectedOption ? '#000' : '#888', flex: 1 }}>
          {selectedOption || 'Select...'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#555" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              height: '75%',
              marginTop: 'auto',
              padding: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialIcons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, { marginBottom: 12, borderWidth: 1, borderColor: '#ddd' }]}
              keyboardType={item.ctltype === 'NUMERIC' ? 'numeric' : 'default'}
              placeholder="Search here..."
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
            />

            <ScrollView>
              {options.length > 0 ? (
                options.map((opt: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.option, { paddingVertical: 12 }]}
                    onPress={() => {
                      onValueChange(opt.value);
                      setSelectedOption(opt);
                      setOpen(false);
                    }}
                  >
                    <View style={{ paddingVertical: 8 }}>
                      {Object.entries(opt).map(([key, value], idx) => {
                        if (key.toLowerCase().includes('id')) return null;
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
                    marginVertical: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text>No data</Text>
                </View>
              )}
            </ScrollView>
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
