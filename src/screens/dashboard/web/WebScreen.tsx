import { ActivityIndicator, Platform, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { MenuItem } from '../../../store/slices/auth/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERP_COLOR_CODE } from '../../../utils/constants';
import useTranslations from '../../../hooks/useTranslations';
import FullViewLoader from '../../../components/loader/FullViewLoader';

type WebRouteParams = { Web: { item: MenuItem } };

const WebScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<WebRouteParams, 'Web'>>();
  const { item } = route.params;

  const { t } = useTranslations();
  
  useLayoutEffect(() => {
    navigation.setOptions({ title: item?.title || t('webScreen.details') });
  }, [navigation, item?.title, t]);

  const [baseLink, setBaseLink] = useState<string>('');
  const [token, setToken] = useState<string>('');
  console.log("🚀 ~ WebScreen ~ baseLink:", baseLink)
  console.log("🚀 ~ WebScreen ~ token:", token)

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedLink, storedToken] = await Promise.all([
          AsyncStorage.getItem('erp_link'),
          AsyncStorage.getItem('erp_token')
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
  
  // Case 1: Absolute URL (starts with http or https)
  if (/^https?:\/\//i.test(itemUrl)) {
    // Force https -> http and add token as query parameter
    const baseUrl = itemUrl.replace(/^https:\/\//i, 'http://');
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}token=${token}`;
  }
  
  // Case 2: Relative URL
  let normalizedBase = (baseLink || '').replace(/\/+$/, '') + '/';
  // Remove "devws" from base URL if present
  normalizedBase = normalizedBase.replace(/\/devws\/?/, '/');
  // Force http:// protocol
  normalizedBase = normalizedBase.replace(/^https:\/\//i, 'http://');
  if (!/^http:\/\//i.test(normalizedBase)) {
    normalizedBase = 'http://' + normalizedBase.replace(/^\/+/, '');
  }
  const cleanedPath = itemUrl.replace(/^\/+/, '');
  const fullUrl = normalizedBase + cleanedPath;
  console.log("🚀 ~ WebScreen ~ normalizedBase:", normalizedBase);
  
  // Add token as query parameter, not as path segment
  const separator = fullUrl.includes('?') ? '/' : '?';
  return `${fullUrl}${separator}token=${token}`;
}, [baseLink, item?.url, token]);

console.log("🚀 ~ WebScreen ~ targetUrl:", targetUrl);

    if (!targetUrl) {
    return (
      <SafeAreaView style={styles.container}>
         <FullViewLoader />
      </SafeAreaView>
    );
  }


  return (
  <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={ERP_COLOR_CODE.ERP_WHITE || '#FFFFFF'}
        translucent={false}
      />
      <WebView 
        source={{ uri: targetUrl }}
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
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onLoadStart={() => console.log('WebView loading started')}
        onLoadEnd={() => console.log('WebView loading finished')}
      />
    </SafeAreaView>
  )
}

export default WebScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ERP_COLOR_CODE.ERP_WHITE || '#FFFFFF',
        marginTop: Platform.OS === 'android' ? 4 : 0,
    },
    webview: {
        flex: 1,
        backgroundColor: ERP_COLOR_CODE.ERP_WHITE || '#FFFFFF',
    },
    // Initial loading state styles
    loadingContainer: {
        flex: 1,
        backgroundColor: ERP_COLOR_CODE.ERP_WHITE || '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loadingContent: {
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 280,
    },
    spinner: {
        marginBottom: 24,
    },
    loadingTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND || '#007AFF',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 28,
    },
    loadingSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
    // WebView loading state styles
    webviewLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor:  '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    webviewLoadingContent: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        
    },
    webviewSpinner: {
        marginBottom: 16,
    },
    webviewLoadingText: {
        fontSize: 16,
        fontWeight: '500',
        color: ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND || '#007AFF',
        textAlign: 'center',
    },
})