// ──────────────────────────────────────────────
// Aether Mobile App — React Native Expo Wrapper
// ──────────────────────────────────────────────
// This file demonstrates how our Vite PWA correctly wraps
// into a native iOS/Android shell using Expo WebView.
// This proves the "Build Once, Run Anywhere" strategy.

import React, { useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, ActivityIndicator, View, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef(null);

  // The local Vite dev server IP or the hosted production URL
  // If running on a physical device, this would be your WiFi IP.
  const AETHER_WEB_URL = 'http://10.0.0.123:5174'; 

  // Handle postMessage from Web to Native (e.g., Push Notifications, GPS, Biometrics)
  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'HAPTIC_FEEDBACK') {
      // Use expo-haptics
      console.log('Vibrating device...');
    }
    
    if (data.type === 'REQUEST_BIOMETRICS') {
      // Use expo-local-authentication
      console.log('Triggering FaceID / Fingerprint...');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#D4A843" />
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: AETHER_WEB_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccessFromFileURLs={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2', // Match Aether's CSS var(--background)
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
