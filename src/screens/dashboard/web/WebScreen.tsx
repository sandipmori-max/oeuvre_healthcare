import { SafeAreaView, StatusBar, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { ERP_COLOR_CODE } from '../../../utils/constants';
import useTranslations from '../../../hooks/useTranslations';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import { styles } from './web_style';
import { useBaseLink } from '../../../hooks/useBaseLink';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WebScreen = () => {
  const { t } = useTranslations();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, isFromChart } = route.params;
  const [token, setToken] = useState<string>('');
  const baseLink = useBaseLink();

  console.log('baseLink', baseLink);

  const url = isFromChart ? `${baseLink}app/index.html?dashboard/0/&token=${token}` : '';

  console.log('url-------------------', url);
  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem('erp_token');
      setToken(storedToken || '');
    })();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isFromChart ? 'Dashboard' : item?.title || t('webScreen.details'),
    });
  }, [navigation, item?.title, t]);

  const targetUrl = useMemo(() => {
    const itemUrl = item?.url || '';
    if (!itemUrl || !token) return '';
    if (/^https?:\/\//i.test(itemUrl)) {
      const baseUrl = itemUrl.replace(/^https:\/\//i, 'http://');
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${token}`;
    }

    const cleanedPath = itemUrl.replace(/^\/+/, '');
    const fullUrl = baseLink + cleanedPath;

    const separator = fullUrl.includes('?') ? '/' : '?';
    return `${fullUrl}${separator}&token=${token}`;
  }, [baseLink, item?.url, token]);

  console.log('targetUrl------------------------', targetUrl);

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
      <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} translucent={false} />
      {
        token ?  <WebView
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
      /> : <FullViewLoader />
      }
     
    </SafeAreaView>
  );
};

export default WebScreen;
