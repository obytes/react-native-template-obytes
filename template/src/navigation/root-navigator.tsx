import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

import { useAuth } from '@/core';

import { AuthNavigator } from './auth-navigator';
import { NavigationContainer } from './navigation-container';
import { TabNavigator } from './tab-navigator';
const Stack = createStackNavigator();

export const Root = () => {
  const { status } = useAuth();
  const hideSplash = React.useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      hideSplash();
    }
  }, [hideSplash, status]);

  return (
    <Stack.Navigator
      screenOptions={{
        cardOverlayEnabled: false,
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      {status === 'signOut' ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="App" component={TabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export const RootNavigator = () => (
  <NavigationContainer>
    <Root />
  </NavigationContainer>
);
