import React, { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { resetAjaxState } from '../../../../store/slices/ajax/ajaxSlice';
import { getAjaxThunk } from '../../../../store/slices/ajax/thunk';
import { resetDropdownState } from '../../../../store/slices/dropdown/dropdownSlice';
import { getDDLThunk } from '../../../../store/slices/dropdown/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const CustomPicker = ({ label, selectedValue, onValueChange, item, errors }: any) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { response: ajaxResponse } = useAppSelector(state => state.ajax);
  const { response: dropDownResponse } = useAppSelector(state => state.dropdown);

  const isAjax = String(item?.ajax) === '1';

  const handleOpen = useCallback(() => {
    if (isAjax) {
      dispatch(resetAjaxState());
      dispatch(getAjaxThunk({ dtlid: item?.dtlid, where: item?.ddlwhere }));
    } else {
      dispatch(resetDropdownState());
      dispatch(getDDLThunk({ dtlid: item?.dtlid, where: item?.ddlwhere }));
    }
    setOpen(o => !o);
  }, [dispatch, isAjax, item?.dtlid, item?.ddlwhere]);

  const listData = useMemo(
    () => (isAjax ? ajaxResponse?.data ?? [] : dropDownResponse?.data ?? []),
    [isAjax, ajaxResponse?.data, dropDownResponse?.data],
  );

  const selectedOption = useMemo(
    () => listData.find((opt: any) => String(opt.value) === String(selectedValue)),
    [listData, selectedValue],
  );

  const displayLabel = selectedOption?.name || '';

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>

      <TouchableOpacity style={[styles.pickerBox]} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={{ color: selectedOption ? '#000' : '#888', flex: 1 }}>
          {displayLabel || 'Select...'}
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
          {listData.length > 0 ? (
            listData.map((opt: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.option}
                onPress={() => {
                  onValueChange(opt.value);
                  setOpen(false);
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
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>{errors[item.field]}</Text>
      )}
    </View>
  );
};

export default React.memo(CustomPicker);
