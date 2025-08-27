import { View, Image, Dimensions } from 'react-native'
import React from 'react'
import MaterialIcons from '@react-native-vector-icons/material-icons'

const Media = ({item}:any) => {
  return (
   <View
          style={{
            width: '100%',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 4,
          }}
        >
          <Image
            key={item.field}
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
            }}
            style={{ borderWidth: 1, width: 100, height: 100, borderRadius: 80 }}
          />
          <View
            style={{
              height: 36,
              width: 36,
              borderRadius: 36,
              backgroundColor: '#fff',
              position: 'absolute',
              bottom: 0,
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              left: Dimensions.get('screen').width / 2,
              borderWidth: 1,
            }}
          >
            <MaterialIcons name={'edit'} color={'#000'} size={20} />
          </View>
        </View>
  )
}

export default Media