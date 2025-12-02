import { View, Text, TextInput } from 'react-native';
import React, { useState } from 'react';
import { styles } from '../page_style';
import { DARK_COLOR, ERP_COLOR_CODE } from '../../../../utils/constants';
import { useAppSelector } from '../../../../store/hooks';

const Input = ({ isValidate, item, errors, value, setValue, onFocus }: any) => {

  const theme = useAppSelector(state => state?.theme.mode);

  React.useEffect(() => {
    setValue(value);
  }, [value]);
  const [isInputEdit, setIsInputEdit] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={[styles.label, theme === 'dark' && {
          color: 'white'
        }]}>{item?.fieldtitle}</Text>
        {item?.fieldtitle !== item?.tooltip && <Text style={[styles.label, theme === 'dark' && {
          color: 'white'
        }]}> - ( {item?.tooltip} )</Text>}
        {item?.mandatory === '1' && <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>}
      </View>
      <TextInput
        multiline={value?.length > 40 ? true : item?.title === 'Card Text' ? true : false}
        editable
        scrollEnabled
        style={[
          styles.textInput,
          errors[item.field] && { borderColor: ERP_COLOR_CODE.ERP_ERROR },
          value && {
            borderColor: 'green',
            borderWidth: 0.8,
          },

          isInputEdit && {
            borderColor: '#81b5e4',
            borderWidth: 0.8,
          },
          isValidate &&
          item?.mandatory === '1' &&
          value && {
            borderColor: 'green',
            borderWidth: 0.8,
          },
          theme === 'dark' && {
            backgroundColor: 'black'
          },
          theme === 'dark' && value && {
            color: 'white'
          }
        ]}
        keyboardType={item?.ctltype === 'NUMERIC' ? 'number-pad' : 'default'}
        value={value.toString()}
        onChangeText={text => setValue(text)}
        placeholder={`Enter ${item?.fieldtitle}`}
        onFocus={e => {
          setIsInputEdit(true);
          onFocus(e);
        }}
        onBlur={() => {
          if (!value) {
            setIsInputEdit(false);
          }
        }}
      />
      {errors[item.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>{errors[item.field]}</Text>
      )}
    </View>
  );
};

export default Input;
