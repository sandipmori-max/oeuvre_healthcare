import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
 
// For smooth expand/collapse animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RemarksView = ({ remarks }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  if (!remarks) return null;
  return (
    <View
      style={{
         paddingHorizontal: 4,
        paddingVertical: 2,
         borderColor: '#E5E7EB',
        width: '100%'
      }}
    >
      <Text
        numberOfLines={isExpanded ? undefined : 2}
        onTextLayout={(e) => setIsTruncated(e.nativeEvent.lines.length > 2)}
        style={{
          color: ERP_COLOR_CODE.ERP_777,
          fontStyle: 'italic',
          fontWeight: '500',
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        {remarks}
      </Text>

      {isTruncated && (
        <TouchableOpacity
          onPress={toggleExpand}
          activeOpacity={0.7}
          style={{
            alignSelf: 'flex-start',
            marginTop: 4,
            backgroundColor: '#EEF2FF',
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 12,
              color: ERP_COLOR_CODE.ERP_COLOR,
            }}
          >
            {isExpanded ? 'See Less ▲' : 'See More ▼'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RemarksView;
