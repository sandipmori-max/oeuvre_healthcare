import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import NoData from '../../../../components/no_data/NoData';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import { styles } from './entry_style';

const accentColors = ['#dbe0f5ff', '#c8f3edff', '#faf1e0ff', '#f0e1e1ff', '#f2e3f8ff', '#e0f3edff'];

const EntryTab = () => {
  const navigation = useNavigation();
  const { menu, isMenuLoading } = useAppSelector(state => state.auth);
  const list = menu?.filter(item => item?.isReport === false) ?? [];

  const renderItem = ({ item, index }: any) => {
    const backgroundColor = accentColors[index % accentColors.length];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Web', { item })}
      >
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(243, 239, 239, 0.42)' }]}>
          <Text style={styles.iconText}>
            {item.title ? item.title.trim().slice(0, 2).toUpperCase() : '?'}
          </Text>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.subtitle}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  if (isMenuLoading) {
    return (
      <View style={styles.centered}>
        <FullViewLoader />
      </View>
    );
  }

  if (list.length === 0) {
    return (
      <View style={styles.centered}>
        <NoData />
      </View>
    );
  }

  return (
    <FlatList
      data={list}
      keyExtractor={item => item?.id}
      numColumns={2}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default EntryTab;
