import React from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider, Toast} from 'ui';
import {RootNavigator} from 'navigation';
import {hydrateAuth, setI18nConfig} from 'core';
import APIProvider from 'api/APIProvider';

setI18nConfig();
hydrateAuth();

const App = () => {
  return (
    <APIProvider>
      <ThemeProvider>
        <RootNavigator />
        <Toast ref={(ref: any) => Toast.setRef(ref)} />
      </ThemeProvider>
    </APIProvider>
  );
};

export default App;
