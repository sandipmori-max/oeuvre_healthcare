import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/NoData';

const ReportTab = () => {
const navigation = useNavigation();
    const {menu, isMenuLoading} = useAppSelector(state => state.auth);
    const list = menu?.filter(item => item?.isReport === true)
    console.log("🚀 ~ ReportTab ~ list:", list)
 
   return (
   <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
       {
        list?.length === 0 && !isMenuLoading ?
           <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            alignContent:'center',
            }}>
                <NoData />
           </View> : <>
            {
               isMenuLoading ? <></> : <FlatList
                           data={list}
                           keyExtractor={item => item?.id}
                           horizontal={false}
                           numColumns={2}
                           contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
                           columnWrapperStyle={{ justifyContent: 'space-between' }}
                           renderItem={({ item }) => (
                               <TouchableOpacity
                                   style={{
                                       flex: 1,
                                       margin: 8,
                                       borderRadius: 16,
                                       padding: 24,
                                       alignItems: 'center',
                                       minWidth: 140,
                                       backgroundColor: "#fff",
                                       borderBlockColor: '#fafafa', 
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.08,
                                    shadowRadius: 12,
                                    elevation: 1,
                                   }}
                                   activeOpacity={0.8}
                                  onPress={() => navigation.navigate('Web', { item })}

                                   
                               >
                                   <Text style={{ fontSize: 32, marginBottom: 8 }}>🚀</Text>
                                   <Text style={{
                                       textAlign: 'center',
                                       fontSize: 16, fontWeight: '600', color: '#222'
                                   }}>{item?.title}</Text>
                               </TouchableOpacity>
                           )}
                       />
           }
           </>
       }
          
          
       </View>
   )
}

export default ReportTab

const styles = StyleSheet.create({})