import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Text, View, FlatList } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getERPPageThunk } from '../../../store/slices/auth/thunk';
import { savePageThunk } from '../../../store/slices/page/thunk';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import NoData from '../../../components/no_data/NoData';
import ErrorMessage from '../../../components/error/Error';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ERPIcon from '../../../components/icon/ERPIcon';
import ErrorModal from './components/ErrorModal';
import CustomPicker from './components/CustomPicker';
import Media from './components/Media';
import Disabled from './components/Disabled';
import Date from './components/Date';
import Input from './components/Input';

type PageRouteParams = { PageScreen: { item: any } };

const PageScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const { response } = useAppSelector(state => state.page);

  const [loadingPageId, setLoadingPageId] = useState<string | null>(null);
  const [controls, setControls] = useState<any[]>([]);
  const [errorsList, setErrorsList] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const route = useRoute<RouteProp<PageRouteParams, 'PageScreen'>>();
  const { item, title, id }: any = route.params;

  /** ✅ validateForm memoized */
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

  /** ✅ header buttons don’t re-render unnecessarily */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          numberOfLines={1}
          style={{ maxWidth: 180, fontSize: 18, fontWeight: '700', color: '#fff' }}>
          {item?.name || 'Details'}
        </Text>
      ),
      headerRight: () => (
        <>
          <ERPIcon
            name="save-as"
            onPress={() => {
              if (validateForm()) {
                const submitValues: Record<string, any> = {};
                controls.forEach(f => {
                  if (f.refcol !== '1') submitValues[f.field] = formValues[f.field];
                });
                dispatch(savePageThunk({ page: title, id, data: { ...submitValues } }));
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
  }, [navigation, item?.name, id, controls, formValues, validateForm]);

  /** ✅ fetchPageData memoized */
  const fetchPageData = useCallback(async () => {
    try {
      setError(null);
      setLoadingPageId(id);
      const parsed = await dispatch(getERPPageThunk({ page: title, id })).unwrap();
      const pageControls = Array.isArray(parsed?.pagectl) ? parsed.pagectl : [];
      setControls(pageControls);
      const initVals: any = {};
      pageControls.forEach(c => (initVals[c.field] = c.text || ''));
      setFormValues(initVals);
    } catch (e: any) {
      setError(e?.message || 'Failed to load page');
    } finally {
      setLoadingPageId(null);
    }
  }, [dispatch, id, title]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  /** ✅ stable renderItem using useCallback */
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const value = formValues[item.field] || '';
      const setValue = (val: string) => {
        setFormValues(prev => ({ ...prev, [item.field]: val }));
        setErrors(prev => ({ ...prev, [item.field]: '' }));
      };

      if (item?.visible === '1') return null;
      if (item.ctltype === 'IMAGE') return <Media item={item} />;
      if (item.disabled === '1') return <Disabled item={item} value={value} />;
      if (item.ddl && item.ddl !== '')
        return (
          <CustomPicker
            label={item.fieldtitle}
            selectedValue={value}
            onValueChange={setValue}
            options={item.options || []}
            item={item}
            errors={errors}
          />
        );
      if (item.ctltype === 'DATE')
        return <Date item={item} errors={errors} value={value} showDatePicker={showDatePicker} />;
      return <Input item={item} errors={errors} value={value} setValue={setValue} />;
    },
    [formValues, errors]
  );

  /** date picker helpers */
  const showDatePicker = (field: string) => {
    setActiveDateField(field);
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
        <FlatList
          showsVerticalScrollIndicator={false}
          data={controls}
          keyExtractor={(it, idx) => it.dtlid || idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
          removeClippedSubviews
        />
      ) : (
        <NoData />
      )}

      <ErrorModal visible={showErrorModal} errors={errorsList} onClose={() => setShowErrorModal(false)} />
      <DateTimePickerModal isVisible={datePickerVisible} mode="date" onConfirm={handleConfirm} onCancel={hideDatePicker} />
    </View>
  );
};

export default PageScreen;
