import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/NoData';
import FullViewLoader from '../../../../components/FullViewLoader';

const EntryTab = () => {
    const navigation = useNavigation();
    const {menu, isMenuLoading} = useAppSelector(state => state.auth);
    const list =  menu?.filter(item => item?.isReport === false);
    console.log("🚀 ~ EntryTab ~ list:", list.length)
  
  return (
    <View>
        {
            isMenuLoading ? <FullViewLoader /> :
           <>
        
             {
                list.length > 0 ?  <FlatList
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
                                    borderBlockColor: '#fafafa',
                                    backgroundColor: '#FFFFFF',
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
                    /> : <NoData />
             }
           </>
           
        }
       
    </View>
  )
}

export default EntryTab

const styles = StyleSheet.create({})