// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* Secondary screens */}
        <Stack.Screen
          name="meal-detail"
          options={{ title: 'Chi tiết món ăn' }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Cài đặt' }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ title: 'Chỉnh sửa hồ sơ' }}
        />
        <Stack.Screen
          name="search"
          options={{ title: 'Tìm kiếm', headerShown: false }}
        />
        <Stack.Screen
          name="notifications"
          options={{ title: 'Thông báo' }}
        />
        <Stack.Screen
          name="favourites"
          options={{ title: 'Yêu thích' }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: 'Chính sách bảo mật' }}
        />
        <Stack.Screen
          name="history-cooking"
          options={{ title: 'Lịch sử nấu ăn' }}
        />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <ThemeProvider value={theme}>
        <APIProvider>
          <BottomSheetModalProvider>
            {children}
            <FlashMessage position="top" />
          </BottomSheetModalProvider>
        </APIProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
