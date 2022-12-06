import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { Onboarding } from '@/screens';

export type WelcomeStackParamList = {
  Welcome: undefined;
};

const Stack = createNativeStackNavigator<WelcomeStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={Onboarding} />
    </Stack.Navigator>
  );
};
