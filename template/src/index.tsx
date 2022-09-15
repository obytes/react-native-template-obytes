import 'react-native-gesture-handler';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import FlashMessage from 'react-native-flash-message';

import { APIProvider } from '@/api';
import { hydrateAuth } from '@/core';
import { RootNavigator } from '@/navigation';

hydrateAuth();
SplashScreen.preventAutoHideAsync();

const App = () => {
  return (
    <BottomSheetModalProvider>
      <APIProvider>
        <RootNavigator />
        <FlashMessage position="top" />
      </APIProvider>
    </BottomSheetModalProvider>
  );
};

export default App;
