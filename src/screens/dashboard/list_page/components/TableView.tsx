import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import React from 'react';
import { styles } from '../list_page_style';
import { formatHeaderTitle } from '../../../../utils/helpers';
import NoData from '../../../../components/no_data/NoData';
import { useNavigation } from '@react-navigation/native';

const TableView = ({
  configData,
  filteredData,
  loadingListId,
  totalAmount,
  pageParamsName,
  handleActionButtonPressed,
}: any) => {
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation();
  const getButtonMeta = (key: string) => {
    if (!key || !configData?.length) return { label: 'Action', color: '#007BFF' };
    const configItem = configData.find(cfg => cfg.datafield?.toLowerCase() === key.toLowerCase());
    return {
      label: configItem?.headertext || 'Action',
      color: configItem?.colorcode || '#007BFF',
    };
  };

  const allKeys = filteredData && filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  function splitInto4Columns(keys: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = { clm1: [], clm2: [], clm3: [], clm4: [] };
    const filteredKeys = keys.filter(key => !key.startsWith('btn_'));
    const firstFour = filteredKeys.slice(0, 4);
    const rest = filteredKeys.slice(4);

    result.clm1.push(firstFour[0] || '');
    result.clm2.push(firstFour[1] || '');
    result.clm3.push(firstFour[2] || '');
    result.clm4.push(firstFour[3] || '');

    rest.forEach((key, index) => {
      const colIndex = index % 4;
      const columnKey = `clm${colIndex + 1}` as keyof typeof result;
      result[columnKey].push(key);
    });

    return result;
  }

  function splitInto4Rows(keys: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = { clm1: [], clm2: [], clm3: [], clm4: [] };

    const firstFour = keys.slice(0, 4);
    const rest = keys.slice(4);

    result.clm1.push(firstFour[0] || '');
    result.clm2.push(firstFour[1] || '');
    result.clm3.push(firstFour[2] || '');
    result.clm4.push(firstFour[3] || '');

    rest.forEach((key, index) => {
      const colIndex = index % 4;
      const columnKey = `clm${colIndex + 1}` as keyof typeof result;
      result[columnKey].push(key);
    });

    return result;
  }

  const columns = splitInto4Columns(allKeys);
  const rows = splitInto4Rows(allKeys);

  const TableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeaderRow]}>
      {Object.values(columns).map((colItems, colIndex) => (
        <View key={`col-${colIndex}`} style={{ flexDirection: 'column', marginRight: 1 }}>
          {colItems.map(key => (
            <Text
              key={key}
              style={[styles.tableHeaderCell, { minWidth: 96, maxWidth: 100, marginBottom: 0 }]}
              numberOfLines={1}
            >
              {formatHeaderTitle(key)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isEven = index % 2 === 0;
    const rowBackgroundColor = isEven ? '#ffffff' : '#f8faf3ff';

    const btnKeys = Object.keys(item).filter(key => key.startsWith('btn_'));

    return (
      <TouchableOpacity
        onPress={async () => {
          navigation.navigate('Page', { item, title: pageParamsName, id: index + 1 });
        }}
      >
        {' '}
        <View
          style={[styles.tableRow, { backgroundColor: rowBackgroundColor, flexDirection: 'row' }]}
        >
          {Object.values(rows).map((colItems, colIndex) => (
            <View key={`row-col-${colIndex}`} style={{ flexDirection: 'column', marginRight: 1 }}>
              {colItems
                .filter(key => !key.startsWith('btn_'))
                .map(key => {
                  let value = item[key];
                  if (typeof value === 'object' && value !== null) {
                    value = JSON.stringify(value);
                  } else if (value === null || value === undefined) {
                    value = '';
                  } else {
                    value = String(value);
                  }
                  return (
                    <Text
                      key={`${key}-${item?.id || Math.random()}`}
                      style={[styles.tableCell, { minWidth: 96, maxWidth: 100, marginBottom: 0 }]}
                      numberOfLines={1}
                    >
                      {value || '-'}
                    </Text>
                  );
                })}
            </View>
          ))}
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            minWidth: 120,
          }}
        >
          {btnKeys.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 }}>
              {btnKeys.map((key, idx) => {
                const actionValue = item[key];
                const authUser = item['authuser'];
                console.log('🚀 ~ authUs̥er:', authUser);
                const { label, color } = getButtonMeta(key);

                return (
                  <TouchableOpacity
                    key={`${key}-${idx}`}
                    style={{
                      backgroundColor: authUser ? 'gray' : color,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 6,
                      flexGrow: 1,
                      maxWidth: (screenWidth - 64) / 2,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      handleActionButtonPressed(actionValue, label, color);
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <FlatList
        data={['']}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => {
          return <TableHeader />;
        }}
        renderItem={() => {
          return (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredData}
              keyExtractor={(item, idx) => String(item?.id || idx)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                !loadingListId ? (
                  <View
                    style={{
                      width: Dimensions.get('screen').width,
                      height: Dimensions.get('screen').height / 2.5,
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <NoData />
                  </View>
                ) : null
              }
              ListFooterComponent={
                filteredData.length > 0 && totalAmount > 0 ? (
                  <View
                    style={{
                      marginTop: 16,
                      padding: 16,
                      borderRadius: 8,
                      backgroundColor: '#f1f1f1',
                      borderWidth: 1,
                      borderColor: '#ddd',
                      marginBottom: 28,
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>
                      Total Amount
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#28a745',
                        marginTop: 4,
                      }}
                    >
                      ₹ {totalAmount.toFixed(2)}
                    </Text>
                  </View>
                ) : null
              }
            />
          );
        }}
      ></FlatList>
    </View>
  );
};

export default TableView;
