import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppDispatch } from '../../../../store/hooks';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { getAjaxThunk } from '../../../../store/slices/ajax/thunk';
import { getDDLThunk } from '../../../../store/slices/dropdown/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const CustomPicker = ({ label, selectedValue, onValueChange, item, errors , dtext}: any) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const dispatch = useAppDispatch();

  const [selectedOption, setSelectedOption] = useState('');


  useEffect(() =>{
    setSelectedOption(dtext)
  },[dtext])

  const isAjax = String(item?.ajax) === '1';

  const handleOpen = useCallback(async () => {
    try {
      if (isAjax) {
        const res = await dispatch(getAjaxThunk({ dtlid: item?.dtlid, where: item?.ddlwhere })).unwrap();
        setOptions(res?.data ?? []);
      } else {
        const res = await dispatch(getDDLThunk({ dtlid: item?.dtlid, where: item?.ddlwhere })).unwrap();
        setOptions(res?.data ?? []);
      }
      setOpen(o => !o);
    } catch (e) {
      setOptions([]);
    }
  }, [dispatch, isAjax, item?.dtlid, item?.ddlwhere]);
 

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>

      <TouchableOpacity style={[styles.pickerBox]} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={{ color: selectedOption ? '#000' : '#888', flex: 1 }}>
          {selectedOption || 'Select...'}
        </Text>
        <MaterialIcons name={open ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color="#555" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownCard}>
          {isAjax && (
            <TextInput
              style={[styles.textInput, { margin: 4 }]}
              keyboardType={item.ctltype === 'NUMERIC' ? 'numeric' : 'default'}
              placeholder="Search here..."
              placeholderTextColor="#888"
            />
          )}
          {options.length > 0 ? (
            options.map((opt: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.option}
                onPress={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                      setSelectedOption(opt?.name)

                }}
              >
                <Text>{opt?.deptname || opt?.name || opt?.text || opt?.label}</Text>
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
        </View>
      )}

      {errors[item.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
          {errors[item.field]}
        </Text>
      )}
    </View>
  );
};


export default React.memo(CustomPicker);
