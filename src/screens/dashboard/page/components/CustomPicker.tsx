import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { styles } from '../page_style';
import { DARK_COLOR, ERP_COLOR_CODE } from '../../../../utils/constants';
import { getDDLThunk } from '../../../../store/slices/dropdown/thunk';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import FullViewLoader from '../../../../components/loader/FullViewLoader';
import useTranslations from '../../../../hooks/useTranslations';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const CustomPicker = ({
  isValidate,
  label,
  selectedValue,
  onValueChange,
  item,
  errors,
  dtext,
  isForceOpen,
}: any) => {
  const { t } = useTranslations();

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const theme = useAppSelector((state) => state?.theme.mode);
  const { user } = useAppSelector((state) => state?.auth);

  const optionsCache = useRef<{ [key: string]: any[] }>({});

  // Bottom sheet animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    setSelectedOption(dtext);
  }, [dtext]);

  // Animate bottom sheet OPEN
  const openBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT * 0.25,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  // Animate bottom sheet CLOSE
  const closeBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: false,
    }).start(() => setOpen(false));
  };

  const handleOpen = useCallback(async () => {
    if (open) {
      closeBottomSheet();
      return;
    }

    setOpen(true);
    openBottomSheet();

    if (item?.dtlid && optionsCache.current[item.dtlid]) {
      setOptions(optionsCache.current[item.dtlid]);
      return;
    }

    setLoader(true);
    try {
      const res = await dispatch(
        getDDLThunk({
          dtlid: item?.dtlid,
          where: !isForceOpen ? `UserID in (${user?.id}, -1)` : item?.ddlwhere,
        }),
      ).unwrap();

      const data = res?.data ?? [];
      setOptions(data);
      if (item?.dtlid) optionsCache.current[item.dtlid] = data;
    } catch (e) {
      setOptions([]);
    } finally {
      setLoader(false);
    }
  }, [dispatch, item?.dtlid, item?.ddlwhere, open]);

  return (
    <View style={{ marginBottom: 16 }}>
      
      {/* Label */}
      {!isForceOpen && (
        <Text style={{ color: 'white', marginBottom: 4 }}>{label}</Text>
      )}

      {isForceOpen && (
        <View style={{ flexDirection: 'row' }}>
          <Text style={[
            styles.label,
            theme === 'dark' && { color: 'white' },
          ]}>
            {label}
          </Text>
          {item?.tooltip !== label && (
            <Text style={[
              styles.label,
              theme === 'dark' && { color: 'white' },
            ]}>
              {' '} - ( {item?.tooltip} )
            </Text>
          )}
          {item?.mandatory === '1' && (
            <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>
          )}
        </View>
      )}

      {/* Picker Touch */}
      <TouchableOpacity
        style={[
          styles.pickerBox,
          item?.disabled === '1' && styles.disabledBox,
          isForceOpen &&
            errors[item?.field] && {
              borderColor: ERP_COLOR_CODE.ERP_ERROR,
            },
          isForceOpen &&
            isValidate &&
            item?.mandatory === '1' &&
            selectedOption && {
              borderColor: 'green',
              borderWidth: 0.8,
            },
          isForceOpen &&
            theme === 'dark' && {
              backgroundColor: DARK_COLOR,
            },
        ]}
        onPress={() => {
          if (item?.disabled !== '1') handleOpen();
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color:
              theme === 'dark'
                ? 'white'
                : selectedOption
                ? ERP_COLOR_CODE.ERP_BLACK
                : ERP_COLOR_CODE.ERP_888,
            flex: 1,
          }}
        >
          {selectedOption || `Select ${label}`}
        </Text>

        <MaterialIcons
          name={open ? 'arrow-drop-up' : 'arrow-drop-down'}
          size={24}
          color={ERP_COLOR_CODE.ERP_555}
        />
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal transparent visible={open} animationType="none">
        {/* Close outside area */}
        <TouchableWithoutFeedback onPress={closeBottomSheet}>
          <View style={{ flex: 1, backgroundColor: '#00000066' }} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            top: slideAnim,
            left: 0,
            right: 0,
            height: SCREEN_HEIGHT * 0.75,
            backgroundColor: theme === 'dark' ? 'black' : 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'white' : 'black',
          }}
        >
          <View style={{flexDirection:'row', justifyContent:'space-between', padding : 12}}>
            <Text
            style={{
              color: theme === 'dark' ? 'white' : ERP_COLOR_CODE.ERP_BLACK,
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            {t("text.text34")} {label}
          </Text>

           <TouchableOpacity
           onPress={()=>{
            setOpen(false)
           }}
           >
            <MaterialIcons
          name={'close'}
          size={24}
          color={ERP_COLOR_CODE.ERP_555}
        />
           </TouchableOpacity>
          </View>

          {loader ? (
            <FullViewLoader />
          ) : (
            <ScrollView>
              {options.length > 0 ? (
                options.map((opt: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.option,
                      {
                        backgroundColor:
                          selectedOption === opt?.name
                            ? ERP_COLOR_CODE.ERP_APP_COLOR
                            : ERP_COLOR_CODE.ERP_WHITE,
                        marginBottom: 4,
                        borderRadius: 8,
                        padding: 12,
                      },
                      theme === 'dark' &&
                        selectedOption === opt?.name && {
                          backgroundColor: 'white',
                        },
                      theme === 'dark' && {
                        backgroundColor: 'black',
                      },
                    ]}
                    onPress={() => {
                      if(!isForceOpen){
                      onValueChange(opt);
                      }else{
                      onValueChange(opt?.value);
                      }
                      setSelectedOption(opt?.name);
                      closeBottomSheet();
                    }}
                  >
                    <Text
                      style={{
                        color:
                          theme === 'dark'
                            ? 'white'
                            : selectedOption === opt?.name
                            ? ERP_COLOR_CODE.ERP_WHITE
                            : ERP_COLOR_CODE.ERP_BLACK,
                      }}
                    >
                      {opt?.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={{
                    marginVertical: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 100,
                  }}
                >
                  <Text style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                    {t("text.text20")}
                  </Text>
 
                  
                </View>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </Modal>

      {/* Error */}
      {isForceOpen && errors[item?.field] && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR, marginTop: 4 }}>
          {errors[item?.field]}
        </Text>
      )}
    </View>
  );
};

export default React.memo(CustomPicker);
