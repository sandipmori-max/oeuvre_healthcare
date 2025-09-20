import { View, Text } from 'react-native';
import React, { useEffect } from 'react';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { useCurrentAddress } from '../../../../hooks/useCurrentLocation';

const LocationRow = ({ item, value, setValue }: any) => {
  const { address, coords, loading, error } = useCurrentAddress();

   useEffect(() => {
    if (!loading && coords) {
      setValue({
        [item?.field]: `${coords.latitude},${coords.longitude}`,
      });
    }
  }, [coords, loading]);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{item?.fieldtitle}</Text>
        {item?.fieldtitle !== item?.tooltip && <Text> - ( {item?.tooltip} )</Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>
      <View style={styles.disabledBox}>
        <Text style={{ color: '#555' }}>
          {loading
            ? 'Fetching...'
            : address
            ? `${address}\n(${coords?.latitude}, ${coords?.longitude})`
            : '---'}
        </Text>
      </View>
    </View>
  );
};

export default LocationRow;
