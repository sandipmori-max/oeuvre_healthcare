import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { resetAjaxState } from '../../../../store/slices/ajax/ajaxSlice';
import { getAjaxThunk } from '../../../../store/slices/ajax/thunk';
import { resetDropdownState } from '../../../../store/slices/dropdown/dropdownSlice';
import { getDDLThunk } from '../../../../store/slices/dropdown/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const CustomPicker = ({ label, selectedValue, onValueChange, options, item, errors }: any) => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const {
    loading: ajxLoader,
    error: ajaxError,
    response: ajaxResponse,
  } = useAppSelector(state => state.ajax);

  const {
    loading: dropDownLoader,
    error: dropDownError,
    response: dropDownResponse,
  } = useAppSelector(state => state.dropdown);

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

      {errors[item.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>{errors[item.field]}</Text>
      )}
    </View>
  );
};

export default CustomPicker;
