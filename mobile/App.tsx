import React, { useRef, useState, useEffect } from 'react';
import { BackHandler, SafeAreaView, StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { CONFIG } from './src/constants/Config';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // 안드로이드 하드웨어 뒤로가기 버튼 처리 최적화
  useEffect(() => {
    const handleBackButton = () => {
      // 웹 내에서 뒤로 갈 페이지가 있다면 웹페이지 뒤로가기 실행
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; 
      }
      // 더 이상 뒤로 갈 곳이 없으면 앱 종료 허용
      return false; 
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ 
          uri: CONFIG.API_BASE_URL,
          headers: { 'Bypass-Tunnel-Reminder': 'true' }
        }}
        style={styles.webview}
        allowsBackForwardNavigationGestures={true}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // 하단 탭바 겹침 방지를 위해 스크롤 바운스 제거 (옵션)
        bounces={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  }
});
