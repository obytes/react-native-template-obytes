import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Text } from '@/ui';

export default function WWW() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    if (title) {
      navigation.setOptions({
        title,
      });
    }
  }, [navigation, title]);

  if (!url || typeof url !== 'string') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid URL</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        onError={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
