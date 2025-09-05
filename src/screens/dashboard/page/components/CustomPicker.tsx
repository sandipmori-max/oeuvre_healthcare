import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAppDispatch } from '../../../../store/hooks';
import { styles } from '../page_style';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { getDDLThunk } from '../../../../store/slices/dropdown/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import FullViewLoader from '../../../../components/loader/FullViewLoader';

const CustomPicker = ({ label, selectedValue, onValueChange, item, errors, dtext }: any) => {
  console.log("🚀 ~ CustomPicker ~ item:", item)
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(false);

  const [selectedOption, setSelectedOption] = useState('');
  console.log('🚀 ~ CustomPicker ~ selectedOption:', selectedOption);

  useEffect(() => {
    setSelectedOption(dtext);
  }, [dtext]);

  const handleOpen = useCallback(async () => {
    try {
      setLoader(true);
      const res = await dispatch(
        getDDLThunk({ dtlid: item?.dtlid, where: item?.ddlwhere }),
      ).unwrap();
      setOptions(res?.data ?? []);
      setOpen(o => !o);
      setLoader(false);
    } catch (e) {
      setOptions([]);
      setLoader(false);
    }
  }, [dispatch, item?.dtlid, item?.ddlwhere]);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {item?.tooltip !== label && <Text> - ( {item?.tooltip} ) </Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>

      <TouchableOpacity
        style={[styles.pickerBox, item?.disabled === '1' && styles.disabledBox]}
        onPress={() => {
          if(item?.disabled !== '1'){
           handleOpen();
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: selectedOption ? '#000' : '#888', flex: 1 }}>
          {selectedOption || `Select ${label}`}
        </Text>
        <MaterialIcons name={open ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color="#555" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownCard}>
          {loader ? (
            <>
              {' '}
              <FullViewLoader />
            </>
          ) : (
            <>
              {' '}
              {options.length > 0 ? (
                options.map((opt: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.option,
                      {
                        backgroundColor:
                          selectedOption === opt?.name
                            ? ERP_COLOR_CODE.ERP_APP_COLOR
                            : ERP_COLOR_CODE.ERP_WHITE,
                      },
                    ]}
                    onPress={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      setSelectedOption(opt?.name);
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedOption === opt?.name
                            ? ERP_COLOR_CODE.ERP_WHITE
                            : ERP_COLOR_CODE.ERP_BLACK,
                      }}
                    >
                      {opt?.name}
                    </Text>
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

export default React.memo(CustomPicker);
