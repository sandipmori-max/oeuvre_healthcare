import { View, Text } from 'react-native';
import React from 'react';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { useCurrentAddress } from '../../../../hooks/useCurrentLocation';

const LocationRow = ({ item,}: any) => {
  const { address, coords, loading, error } = useCurrentAddress();
  console.log("🚀 ~ LocationRow ~ coords:", coords)

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{item?.fieldtitle}</Text>
        {item?.fieldtitle !== item?.tooltip && <Text> - ( {item?.tooltip} )</Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>
      <View style={styles.disabledBox}>
        <Text style={{ color: '#555' }}>
          {loading ? 'Fetching...' : address || '---'}
        </Text>
      </View>
    </View>
  );
};

export default LocationRow;