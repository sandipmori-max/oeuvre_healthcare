import { View } from 'react-native'
import React from 'react'
import FastImage from 'react-native-fast-image'

import { ERP_GIF } from '../../assets'
import { styles } from './no_data_style'

const NoData = () => {
  return (
   <View style={styles.loadingContainer}>
            <FastImage
            source={ERP_GIF.NO_DATA}
             style={styles.gif}
             resizeMode="contain"
           />
         </View>
  )
}

export default NoData
