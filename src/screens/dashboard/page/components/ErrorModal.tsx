import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../page_style';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { useAppSelector } from '../../../../store/hooks';
import useTranslations from '../../../../hooks/useTranslations';

const ErrorModal = ({
  visible,
  errors,
  onClose,
}: {
  visible: boolean;
  errors: string[];
  onClose: () => void;
}) => {
    const theme = useAppSelector(state => state?.theme.mode);
  const { t } = useTranslations();
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.bottomSheet, theme==='dark' && {
          backgroundColor: 'black',
          borderWidth: 1,
          borderColor: 'white'
        }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={[styles.title, theme === 'dark' && {
              color: 'white'
            }]}>{t("text.text35")}-</Text>
            <TouchableOpacity
              onPress={() => {
                onClose();
              }}
            >
              <MaterialIcons name={'close'} size={20} color={ERP_COLOR_CODE.ERP_555} />
            </TouchableOpacity>
          </View>
          <View style={{ marginVertical: 14 }}>
            <FlatList
              data={errors}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <Text style={styles.errorText}>• {item}</Text>}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;
