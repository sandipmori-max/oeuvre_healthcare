import { SafeAreaView, StatusBar, Text, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { ERP_COLOR_CODE } from '../../../utils/constants';
import useTranslations from '../../../hooks/useTranslations';
import FullViewLoader from '../../../components/loader/FullViewLoader';
import { styles } from './web_style';
import { useBaseLink } from '../../../hooks/useBaseLink';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ERPIcon from '../../../components/icon/ERPIcon';

const WebScreen = () => {
  const { t } = useTranslations();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item, isFromChart } = route.params;
  const [token, setToken] = useState<string>('');
  const [isHidden, setIsHidden] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const webviewRef = useRef<WebView>(null);
  const baseLink = useBaseLink();

  const url = isFromChart ? `${baseLink}app/index.html?dashboard/0/&token=${token}` : '';

  console.log("url----------------", url);

  useEffect(() => {
    (async () => {
      const storedToken = await AsyncStorage.getItem('erp_token');
      setToken(storedToken || '');
    })();
  }, []);

  useEffect(() => {
  return () => {
     try {
      console.log('🧹 Cleaning WebView cache on unmount...');
      webviewRef.current?.clearCache(true);
      webviewRef.current?.clearHistory();
    } catch (e) {
      console.warn('Cache clear failed:', e);
    }
  };
}, []);


  const toggleDiv = () => {
    const jsCode = `
      (function() {
        const div = document.getElementById('divPage');
        if (div) {
          div.style.display = '${isHidden ? 'block' : 'none'}';
        }
      })();
      true;
    `;
    webviewRef?.current?.injectJavaScript(jsCode);
    setIsHidden(prev => !prev);
  };
const [webKey, setWebKey] = useState(Date.now());

useEffect(() => {
  return () => {
    console.log('🧹 WebView unmounted — forcing cache clear...');
    setWebKey(Date.now()); // resets key = full WebView re-render
  };
}, []);
 

  const reloadWebView = () => {
      setWebKey(Date.now());

    setIsReloading(true);
     try {
    webviewRef.current?.clearCache(true);
    webviewRef.current?.clearHistory();
  } catch (e) {
    console.warn('Cache clear failed:', e);
  }
  webviewRef.current?.reload();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          numberOfLines={1}
          style={{ maxWidth: 180, fontSize: 18, fontWeight: '700', color: ERP_COLOR_CODE.ERP_WHITE }}
        >
          {isFromChart ? 'Dashboard' : item?.title || t('webScreen.details')}
        </Text>
      ),
      headerRight: () => (
        <>
          {isFromChart || item?.title === 'Attendance Code' ? (
            <>
              <ERPIcon name={'refresh'} onPress={reloadWebView} />
            </>
          ) : (
            <>
              <ERPIcon name={'refresh'} onPress={reloadWebView} />
              <ERPIcon name={'filter-alt'} onPress={toggleDiv} />
            </>
          )}
        </>
      ),
    });
  }, [navigation, item?.title, t, isHidden]);

 const targetUrl = useMemo(() => {
  const itemUrl = item?.url || '';
  if (!itemUrl || !token) return '';

  let url = itemUrl;

  // Ensure http protocol
  if (/^https?:\/\//i.test(url)) {
    url = url.replace(/^https:\/\//i, 'http://');
  } else {
    const cleanedPath = url.replace(/^\/+/, '');
    url = baseLink + cleanedPath;
  }

  if (url.includes('?')) {
    const lastChar = url.slice(-1);
    if (lastChar === '/' || lastChar === '&') {
      return `${url}token=${token}`;
    } else if (!url.includes('=')) {
      return `${url}/&token=${token}`;
    } else {
      return `${url}&token=${token}`;
    }
  } else {
    return `${url}?token=${token}`;
  }
}, [baseLink, item?.url, token]);


  if ((!isFromChart && !targetUrl) || (isFromChart && !url)) {
    return (
      <SafeAreaView style={styles.container}>
        <FullViewLoader />
      </SafeAreaView>
    );
  }

  console.log("targetUrl===========================", targetUrl)

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} translucent={false} />
      {token ? (
        <>
          <WebView
            ref={webviewRef}
            source={{ uri: isFromChart ? url : targetUrl }}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={false}
            style={styles.webview}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={true}
            decelerationRate={0.998}
            cacheEnabled={true}
              incognito={true}       
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
              setIsReloading(false);
            }}
            onLoadStart={() => {
              webviewRef.current?.clearCache(true);
              webviewRef.current?.clearHistory();
              setIsReloading(true);
            }}
            onLoadEnd={() => {
              setIsReloading(false);
              // const jsCode = `
              //   (function() {
              //     const div = document.getElementById('divPage');
              //     if (div) {
              //       div.style.display = 'none';
              //     }
              //   })();
              //   true;
              // `;
              // webviewRef.current?.injectJavaScript(jsCode);
              // setIsHidden(true)
            }}
            injectedJavaScript={`
              (function() {
                const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
                const allClasses = Array.from(document.querySelectorAll('[class]')).map(el => el.className);
                window.ReactNativeWebView.postMessage(JSON.stringify({ ids: allIds, classes: allClasses }));
              })();
              true;
            `}
            onMessage={event => {
              console.log('✅ WebView sent a message!');
              const data = JSON.parse(event.nativeEvent.data);
              console.log('All IDs:', data.ids);
              console.log('All Classes:', data.classes);
            }}
          />
        </>
      ) : (
        <FullViewLoader />
      )}
    </SafeAreaView>
  );
};

export default WebScreen;
