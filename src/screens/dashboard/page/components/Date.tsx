import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { formatDateHr } from '../../../../utils/helpers';

const DateRow = ({ item, errors, value, showDatePicker }: any) => {
  console.log("🚀 ~ DateRow ~ value:", value)
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{item?.fieldtitle}</Text>
        {item?.fieldtitle !== item?.tooltip && <Text> - ( {item?.tooltip} )</Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>
      <TouchableOpacity
        style={[styles.dateBox, errors[item.field] && { borderColor: ERP_COLOR_CODE.ERP_ERROR }]}
        onPress={() => showDatePicker(item?.field, value)}
      >
        <Text style={{ color: value ? '#000' : '#888' }}>
          {value ? formatDateHr(value, false) : 'dd/mmm/yyyy'}
        </Text>
        <MaterialIcons name="event" size={20} color="#555" />
      </TouchableOpacity>
      {errors[item.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
          {errors[item?.field]}
        </Text>
      )}
    </View>
  );
};

export default DateRow;
