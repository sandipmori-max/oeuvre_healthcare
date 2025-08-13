import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'
import { ERP_GIF } from '../assets'

const FullViewLoader = () => {
  return (
   <View style={styles.loadingContainer}>
            <FastImage
            source={ERP_GIF.LOADING}
             style={styles.gif}
             resizeMode="contain"
           />
         </View>
  )
}

export default FullViewLoader

const styles = StyleSheet.create({
     loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   gif: {
    width: 200,
    height: 200 
    },
})