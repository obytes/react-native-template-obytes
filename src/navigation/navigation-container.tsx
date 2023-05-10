import type { Theme } from '@react-navigation/native';
import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const NavigationContainer = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme?: Theme | undefined;
}) => {
  return (
    <SafeAreaProvider>
      <RNNavigationContainer theme={theme}>{children}</RNNavigationContainer>
    </SafeAreaProvider>
  );
};
