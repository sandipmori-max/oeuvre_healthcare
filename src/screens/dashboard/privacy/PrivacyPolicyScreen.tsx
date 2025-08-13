import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

const PrivacyPolicyScreen = () => {
  return (
   <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: 'http://www.deverp.com/index.aspx?q=deverp_privacy_policy' }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});

export default PrivacyPolicyScreen;
