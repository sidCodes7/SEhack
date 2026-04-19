import React, { useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, ActivityIndicator, View, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef(null);

  // The local Vite dev server IP
  const AETHER_WEB_URL = 'http://10.10.125.254:5174'; 

  // Handle postMessage from Web to Native (e.g., Push Notifications, GPS, Biometrics)
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1A1A1A" />
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
