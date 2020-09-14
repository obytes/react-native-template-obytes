import * as React from 'react';
import {NavigationContainer} from './NavigationContainer';
import {TabNavigator} from './TabNavigator';

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};
