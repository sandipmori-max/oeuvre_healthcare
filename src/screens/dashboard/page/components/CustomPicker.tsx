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
  console.log("🚀 ~ CustomPicker ~ selectedValue:", selectedValue)
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  const { loading: ajxLoader, response: ajaxResponse } = useAppSelector(state => state.ajax);
  const { loading: dropDownLoader, response: dropDownResponse } = useAppSelector(state => state.dropdown);

  const isAjax = String(item?.ajax) === '1'; // ✅ normalize check

  const handleOpen = () => {
    if (isAjax) {
      dispatch(resetAjaxState());
      dispatch(getAjaxThunk({ dtlid: item?.dtlid, where: item?.ddlwhere }));
    } else {
      dispatch(resetDropdownState());
      dispatch(getDDLThunk({ dtlid: item?.dtlid, where: item?.ddlwhere }));
    }
    setOpen(!open);
  };

  const listData = isAjax ? ajaxResponse?.data ?? [] : dropDownResponse?.data ?? [];

  const selectedOption = listData.find((opt: any) => String(opt.value) === String(selectedValue));
  console.log("🚀 ~ CustomPicker ~ selectedOption:", selectedOption)

  const displayLabel =
    selectedOption?.deptname ||
    selectedOption?.name ||
    selectedOption?.text ||
    selectedOption?.label ||
    '';

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
              onChangeText={e => {}}
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

export default CustomPicker;
