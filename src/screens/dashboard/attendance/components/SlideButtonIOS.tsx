import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import useTranslations from '../../../../hooks/useTranslations';

const SLIDE_WIDTH = Dimensions.get('screen').width - 30;
const SLIDER_SIZE = 44;

interface Props {
  onSlideSuccess: () => void;
  label: string;
  successColor?: string;
  loading?: boolean;
  completed?: boolean;
}

const SlideButtonIOS: React.FC<Props> = ({
  onSlideSuccess,
  label,
  successColor = ERP_COLOR_CODE.ERP_APP_COLOR,
  loading = false,
  completed = false,
}) => {
  const { t } = useTranslations();

  return (
    <TouchableOpacity
      onPress={() => {
        if (!loading && !completed) onSlideSuccess();
      }}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[styles.sliderContainer, { borderColor: successColor }]}>
        <Text style={styles.label}>
          {loading ? t("text.text22") : completed ? t('text.text23') : label}
        </Text>

        <View style={[styles.slider, { backgroundColor: successColor }]}>
          {loading ? (
            <ActivityIndicator color={ERP_COLOR_CODE.ERP_WHITE} />
          ) : (
            <MaterialIcons
              name={completed ? 'task-alt' : 'keyboard-double-arrow-right'}
              color="white"
              size={22}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 20 },
  sliderContainer: {
    width: SLIDE_WIDTH,
    height: SLIDER_SIZE,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: { position: 'absolute', alignSelf: 'center', fontWeight: '600', color: ERP_COLOR_CODE.ERP_555 },
  slider: { width: SLIDER_SIZE, height: SLIDER_SIZE, borderRadius: 6, justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0, top: 0 },
});

export default SlideButtonIOS;