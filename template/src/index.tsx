import 'react-native-gesture-handler';

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
    <APIProvider>
      <RootNavigator />
      <FlashMessage position="top" />
    </APIProvider>
  );
};

export default App;
