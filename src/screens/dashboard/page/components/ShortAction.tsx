import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { handleEmailPress, handleLocationPress, handlePhonePress } from '../../../../utils/helpers'
import MaterialIcons from '@react-native-vector-icons/material-icons'
import { ERP_COLOR_CODE } from '../../../../utils/constants'

const ShortAction = ({item, value}: any) => {
    const title = item?.fieldtitle?.toLowerCase();

  return (
    <View style={{flexDirection: 'row'}}>
  { value && (title?.includes("mobile no") || title?.includes("phone")) && (
    <TouchableOpacity style={styles.iconButton} onPress={() => handlePhonePress(value)}>
      <MaterialIcons color={ERP_COLOR_CODE.ERP_APP_COLOR} name='phone' size={16} />
    </TouchableOpacity>
  )}

  { value && (title?.includes("e-mail") || title?.includes("email") || title?.includes("email id")) && (
    <TouchableOpacity style={styles.iconButton} onPress={() => handleEmailPress(value)}>
      <MaterialIcons color={ERP_COLOR_CODE.ERP_APP_COLOR} name='email' size={16} />
    </TouchableOpacity>
  )}

  { value && title?.includes("location") && (
    <TouchableOpacity style={styles.iconButton} onPress={() => handleLocationPress(value)}>
      <MaterialIcons color={ERP_COLOR_CODE.ERP_APP_COLOR} name='location-pin' size={18} />
    </TouchableOpacity>
  )}
</View>
  )
}

const styles = StyleSheet.create({
  iconButton: {
    marginHorizontal: 8,
  }
});

export default ShortAction