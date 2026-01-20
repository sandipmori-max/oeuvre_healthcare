import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { handleEmailPress, handleLocationPress, handlePhonePress } from '../../../../utils/helpers'
import MaterialIcons from '@react-native-vector-icons/material-icons'

const ShortAction = ({item, value}: any) => {
    const title = item?.fieldtitle?.toLowerCase();

  return (
    <View style={{flexDirection: 'row'}}>
  { value && (title?.includes("mobile no") || title?.includes("phone")) && (
    <TouchableOpacity style={styles.iconButton} onPress={() => handlePhonePress(value)}>
      <MaterialIcons name='phone' size={22} />
    </TouchableOpacity>
  )}

  { value && (title?.includes("e-mail") || title?.includes("email") || title?.includes("email id")) && (
    <TouchableOpacity style={styles.iconButton} onPress={() => handleEmailPress(value)}>
      <MaterialIcons name='email' size={22} />
    </TouchableOpacity>
  )}

  { value && title?.includes("location") && (
    <TouchableOpacity style={styles.iconButton} onPress={() => handleLocationPress(value)}>
      <MaterialIcons name='location-pin' size={22} />
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