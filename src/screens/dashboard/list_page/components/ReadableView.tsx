import { View, Text, TouchableOpacity, Dimensions, FlatList, Image } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { formatDateToDDMMMYYYY } from '../../../../utils/helpers';
import { styles } from '../list_page_style';
import NoData from '../../../../components/no_data/NoData';
import { ERP_ICON } from '../../../../assets';
import { ERP_COLOR_CODE } from '../../../../utils/constants';

const ReadableView = ({
  configData,
  filteredData,
  loadingListId,
  totalAmount,
  pageParamsName,
  handleItemPressed,
  handleActionButtonPressed,
}: any) => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;

  const getButtonMeta = (key: string) => {
    if (!key || !configData?.length) return { label: 'Action', color: '#007BFF' };
    const configItem = configData.find(cfg => cfg.datafield?.toLowerCase() === key.toLowerCase());
    return {
      label: configItem?.headertext || 'Action',
      color: configItem?.colorcode || '#007BFF',
    };
  };

  const RenderCard = ({ item, index }: any) => {
    if (!item) return null;
    const name = item['name'] || `Item #${index + 1}`;
    const subName = item['number'] || `Item #${index + 1}`;
    const [isRemarksExpanded, setRemarksExpanded] = useState(false);

    const status = item['status'];
    const date = item['date'];
    const remarks = item['remarks'];
    const address = item['address'];
    const amount = item['amount'];

    const btnKeys = Object.keys(item).filter(key => key.startsWith('btn_'));

    const avatarLetter = name
      .split('')
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingBottom: 16,
          marginVertical: 4,
          paddingTop: 16,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={async () => {
            navigation.navigate('Page', { item, title: pageParamsName, id: index + 1 });
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            {/* <Text style={{ color: '#fff', fontWeight: '400', fontSize: 22 }}>{avatarLetter}</Text> */}
            <Image source={ERP_ICON.APP_LOGO} style={styles.profileImage} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
              {name}
            </Text>
            <Text style={{ fontSize: 12 }} numberOfLines={1}>
              {subName}
            </Text>
          </View>

          <View
            style={{
              alignSelf: 'flex-end',
              alignContent: 'flex-end',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <Text style={{ fontWeight: '600', color: '#000' }}>{status}</Text>
            {!!date && (
              <Text style={{ fontWeight: '600', color: '#ccc' }}>
                {formatDateToDDMMMYYYY(date)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => handleItemPressed(item, pageParamsName)}>
          {(remarks || address || amount) && (
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View
                  style={{
                    width: '70%',
                  }}
                >
                  {!!remarks && (
                    <>
                      <Text
                        numberOfLines={isRemarksExpanded ? undefined : 2}
                        style={{
                          color: '#777',
                          fontStyle: 'italic',
                          marginBottom: 6,
                        }}
                      >
                        {remarks}
                      </Text>
                      {remarks.length > 60 && (
                        <TouchableOpacity onPress={() => setRemarksExpanded(prev => !prev)}>
                          <Text style={{ color: '#007bff', fontSize: 12, marginBottom: 6 }}>
                            {isRemarksExpanded ? 'See Less ▲' : 'See More ▼'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
                <View
                  style={{
                    width: '30%',
                    alignItems: 'flex-end',
                  }}
                >
                  {!!amount && (
                    <Text
                      numberOfLines={1}
                      style={{
                        textAlign: 'right',
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#28a745',
                      }}
                    >
                      ₹ {amount}
                    </Text>
                  )}
                </View>
              </View>
              <View>
                {!!address && (
                  <Text
                    numberOfLines={2}
                    style={{
                      color: '#444',
                    }}
                  >
                    📍 {address}
                  </Text>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {btnKeys.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 1 }}>
            {btnKeys.map((key, idx) => {
              const actionValue = item[key];
              const { label, color } = getButtonMeta(key);
              const authUser = item['authuser'];
              return (
                <TouchableOpacity
                  key={`${key}-${idx}`}
                  style={{
                    backgroundColor: authUser ? 'gray' : color,
                    paddingHorizontal: 6,
                    paddingVertical: 8,
                    borderRadius: 6,
                    flexGrow: 1,
                    maxWidth: (screenWidth - 64) / 2,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    if (authUser) {
                      return;
                    }

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
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredData}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, idx) => String(item?.id || idx)}
        renderItem={({ item, index }) => <RenderCard item={item} index={index} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loadingListId ? (
            <View
              style={{
                width: Dimensions.get('screen').width,
                height: Dimensions.get('screen').height / 2.5,
                justifyContent: 'center',
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
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>Total Amount</Text>
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
    </View>
  );
};

export default ReadableView;
