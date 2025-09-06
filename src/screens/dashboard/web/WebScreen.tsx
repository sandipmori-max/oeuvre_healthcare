import { SafeAreaView, StatusBar, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { MenuItem } from '../../../store/slices/auth/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERP_COLOR_CODE } from '../../../utils/constants';
import useTranslations from '../../../hooks/useTranslations';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import { styles } from './web_style';


const WebScreen = () => {
  const { t } = useTranslations();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item , isFromChart } = route.params;
  console.log("🚀 ~ WebScreen ~ isFromChart:", isFromChart)
  const [baseLink, setBaseLink] = useState<string>('');
  console.log("🚀 ~ WebScreen ~ baseLink:", baseLink)
  const [token, setToken] = useState<string>('');

   let normalizedBase = (baseLink || '').replace(/\/+$/, '') + '';
    normalizedBase = normalizedBase.replace(/\/devws\/?/, '/');
    normalizedBase = normalizedBase.replace(/^https:\/\//i, 'http://');


  const url = isFromChart ? `${normalizedBase}app/index.html?dashboard/0/&token=${token}` : '';
  console.log("🚀 ~ WebScreen *-*-*-*-*-*-*--*-*-*-**-~ url:", url)
  
  console.log("🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 ~ WebScreen ~ url:", url)
  useLayoutEffect(() => {
    navigation.setOptions({ title:  isFromChart ? 'Dashboard' : item?.title || t('webScreen.details') });
  }, [navigation, item?.title, t]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedLink, storedToken] = await Promise.all([
          AsyncStorage.getItem('erp_link'),
          AsyncStorage.getItem('erp_token'),
          
        ]);

        if (isMounted) {
          setBaseLink(storedLink || '');
          setToken(storedToken || '');
        }
      } catch (e) {
        console.error('Error loading stored data:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const targetUrl = useMemo(() => {
    const itemUrl = item?.url || '';
    if (!itemUrl || !token) return '';
    if (/^https?:\/\//i.test(itemUrl)) {
      const baseUrl = itemUrl.replace(/^https:\/\//i, 'http://');
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${token}`;
    }

    let normalizedBase = (baseLink || '').replace(/\/+$/, '') + '/';
    normalizedBase = normalizedBase.replace(/\/devws\/?/, '/');
    normalizedBase = normalizedBase.replace(/^https:\/\//i, 'http://');
    if (!/^http:\/\//i.test(normalizedBase)) {
      normalizedBase = 'http://' + normalizedBase.replace(/^\/+/, '');
    }
    const cleanedPath = itemUrl.replace(/^\/+/, '');
    const fullUrl = normalizedBase + cleanedPath;
    console.log('🚀 ~ WebScreen ~ normalizedBase:', normalizedBase);

    const separator = fullUrl.includes('?') ? '/' : '?';
    return `${fullUrl}${separator}&token=${token}`;
  }, [baseLink, item?.url, token]);
  console.log('🚀 ~ WebScreen ~ targetUrl:-------', targetUrl);

  if (!isFromChart && !targetUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <FullViewLoader />
      </SafeAreaView>
    );
  }

  if (isFromChart && !url) {
    return (
      <SafeAreaView style={styles.container}>
        <FullViewLoader />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR}
        translucent={false}
      />
      <WebView
        source={{ uri: isFromChart ? url : targetUrl }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={true}
        decelerationRate={0.998}
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        renderLoading={() => (
          <View style={styles.webviewLoadingContainer}>
            <View style={styles.webviewLoadingContent}>
              <FullViewLoader />
            </View>
          </View>
        )}
        allowsBackForwardNavigationGestures={true}
        textZoom={100}
        allowsLinkPreview={false}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onLoadStart={() => console.log('WebView loading started')}
        onLoadEnd={() => console.log('WebView loading finished')}
      />
    </SafeAreaView>
  );
};

export default WebScreen;
