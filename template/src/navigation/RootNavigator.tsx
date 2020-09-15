import React, {useEffect} from 'react';
import RNBootSplash from 'react-native-bootsplash';
import {createStackNavigator} from '@react-navigation/stack';

import {useAuth} from 'core';
import {NavigationContainer} from './NavigationContainer';
import {TabNavigator} from './TabNavigator';
import {AuthNavigator} from './AuthNavigator';

const Stack = createStackNavigator();

export const Root = () => {
  const {status} = useAuth();
  useEffect(() => {
    if (status !== 'idle') {
      RNBootSplash.hide({fade: true});
    }
  }, [status]);
  return (
    <Stack.Navigator
      headerMode="none"
      screenOptions={{
        cardOverlayEnabled: false,
        gestureEnabled: false,
        animationTypeForReplace: status === 'signIn' ? 'push' : 'pop',
      }}>
      {status === 'signIn' ? (
        <Stack.Screen name="App" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export const RootNavigator = () => (
  <NavigationContainer>
    <Root />
  </NavigationContainer>
);
