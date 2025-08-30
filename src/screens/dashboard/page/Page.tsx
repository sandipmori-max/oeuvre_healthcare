import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch } from '../../../store/hooks';
import { getERPPageThunk } from '../../../store/slices/auth/thunk';
import { savePageThunk } from '../../../store/slices/page/thunk';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import NoData from '../../../components/no_data/NoData';
import ErrorMessage from '../../../components/error/Error';
import ERPIcon from '../../../components/icon/ERPIcon';
import ErrorModal from './components/ErrorModal';
import CustomPicker from './components/CustomPicker';
import Media from './components/Media';
import Disabled from './components/Disabled';
import Input from './components/Input';
import CustomAlert from '../../../components/alert/CustomAlert';
import AjaxPicker from './components/AjaxPicker';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { parseCustomDatePage } from '../../../utils/helpers';
import DateRow from './components/Date';

type PageRouteParams = { PageScreen: { item: any } };

const PageScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const [controls, setControls] = useState<any[]>([]);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [goBack, setGoBack] = useState(false);
  const [loader, setLoader] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const route = useRoute<RouteProp<PageRouteParams, 'PageScreen'>>();
  const { item, title, id }: any = route.params;

  const validateForm = useCallback(() => {
    const validationErrors: Record<string, string> = {};
    const errorMessages: string[] = [];

    controls.forEach(ctrl => {
      if (ctrl.mandatory === '1' && !formValues[ctrl.field]) {
        validationErrors[ctrl.field] = `${ctrl.fieldtitle || ctrl.field} is required`;
        errorMessages.push(`${ctrl.fieldtitle || ctrl.field} is required`);
      }
    });

    setErrors(validationErrors);
    setErrorsList(errorMessages);
    if (errorMessages.length > 0) setShowErrorModal(true);

    return errorMessages.length === 0;
  }, [controls, formValues]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          numberOfLines={1}
          style={{ maxWidth: 180, fontSize: 18, fontWeight: '700', color: '#fff' }}
        >
          {item?.name || 'Details'}
        </Text>
      ),
      headerRight: () => (
        <>
          <ERPIcon
            name="save-as"
            onPress={async () => {
              if (validateForm()) {
                const submitValues: Record<string, any> = {};
                controls.forEach(f => {
                  if (f.refcol !== '1') submitValues[f.field] = formValues[f.field];
                });

                try {
                  setLoader(true);
                  await dispatch(
                    savePageThunk({ page: title, id, data: { ...submitValues } }),
                  ).unwrap();
                  setLoader(false);
                  fetchPageData();
                  setAlertConfig({
                    title: 'Record saved',
                    message: `Record saved successfully!`,
                    type: 'success',
                  });
                  setAlertVisible(true);
                  setGoBack(true);
                } catch (err: any) {
                  setLoader(false);

                  setAlertConfig({
                    title: 'Record saved',
                    message: `Record not saved!`,
                    type: 'error',
                  });
                  setAlertVisible(true);
                  setGoBack(false);
                }
              }
            }}
          />

          <ERPIcon
            name="refresh"
            onPress={() => {
              fetchPageData();
              setErrors({});
              setErrorsList([]);
            }}
          />
        </>
      ),
    });
  }, [
    navigation,
    item?.name,
    id,
    controls,
    formValues,
    validateForm,
    goBack,
    alertVisible,
    loader,
  ]);

  const fetchPageData = useCallback(async () => {
    try {
      setError(null);
      setLoadingPageId(id);

      const parsed = await dispatch(getERPPageThunk({ page: title, id })).unwrap();
      const pageControls = Array.isArray(parsed?.pagectl) ? parsed.pagectl : [];

      const normalizedControls = pageControls.map(c => ({
        ...c,
        disabled: String(c.disabled ?? '0'),
        visible: String(c.visible ?? '1'),
        mandatory: String(c.mandatory ?? '0'),
      }));

      setControls(normalizedControls);

      setFormValues(prev => {
        const merged: any = { ...prev };
        normalizedControls.forEach(c => {
          if (merged[c.field] === undefined) {
            merged[c.field] = c.text ?? '';
          }
        });
        return merged;
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load page');
    } finally {
      setLoadingPageId(null);
    }
  }, [dispatch, id, title]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleAttachment = (base64: string, val: any) => {
    setFormValues(prev => {
      if (typeof val === 'object' && val !== null && val.field) {
        return { ...prev, [val.field]: base64 };
      }
      return { ...prev, image: base64 };
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const setValue = (val: any) => {
        setFormValues(prev => {
          if (typeof val === 'object' && val !== null) {
            return { ...prev, ...val };
          } else {
            return { ...prev, val };
          }
        });
        setErrors(prev => ({ ...prev, [item?.field]: '' }));
      };
      const value = formValues[item?.field] || formValues[item?.text] || '';

      if (item?.visible === '1') return null;
      if (item?.ctltype === 'IMAGE')
        return <Media item={item} handleAttachment={handleAttachment} />;
      if (item?.disabled === '1') return <Disabled item={item} value={value} />;
      if (item?.ddl && item?.ddl !== '' && item?.ajax === 0) {
        return (
          <CustomPicker
            label={item?.fieldtitle}
            selectedValue={value}
            dtext={item?.dtext || item?.text || ''}
            onValueChange={setValue}
            options={item?.options || []}
            item={item}
            errors={errors}
          />
        );
      }
      if (item?.ddl && item?.ddl !== '' && item?.ajax === 1) {
        return (
          <AjaxPicker
            label={item?.fieldtitle}
            selectedValue={value}
            dtext={item?.dtext || item?.text || ''}
            onValueChange={setValue}
            options={item?.options || []}
            item={item}
            errors={errors}
            formValues={formValues}
          />
        );
      }

      if (item?.ctltype === 'DATE') {
        return (
          <DateRow item={item} errors={errors} value={value} showDatePicker={showDatePicker} />
        );
      }

      return <Input item={item} errors={errors} value={value} setValue={setValue} />;
    },
    [formValues, errors],
  );

  const showDatePicker = (field: string, date: any) => {
    setActiveDateField(field);
    setActiveDate(date);
    setDatePickerVisible(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisible(false);
    setActiveDateField(null);
  };
  const handleConfirm = (date: Date) => {
    if (activeDateField) {
      setFormValues(prev => ({ ...prev, [activeDateField]: date.toISOString() }));
    }
    hideDatePicker();
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
      {loadingPageId ? (
        <FullViewLoader />
      ) : !!error ? (
        <ErrorMessage message={error} />
      ) : controls.length > 0 ? (
        <>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={controls}
            keyExtractor={(it, idx) => it?.dtlid || idx?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
            removeClippedSubviews
          />

          {loader && (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
              }}
            >
              <FullViewLoader />
            </View>
          )}
        </>
      ) : (
        <NoData />
      )}

      <ErrorModal
        visible={showErrorModal}
        errors={errorsList}
        onClose={() => setShowErrorModal(false)}
      />
      <DateTimePicker
        isVisible={datePickerVisible}
        mode="date"
        date={activeDate ? parseCustomDatePage(activeDate) : new Date()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertVisible(false);
          if (goBack) {
            navigation.goBack();
          }
        }}
        actionLoader={undefined}
      />
    </View>
  );
};

export default PageScreen;
