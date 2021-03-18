import React from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider, Toast} from 'ui';
import {RootNavigator} from 'navigation';
import {setI18nConfig, AuthProvider} from 'core';
import APIProvider from 'api/APIProvider';

setI18nConfig();

const App = () => {
  return (
    <APIProvider>
      <AuthProvider>
        <ThemeProvider>
          <RootNavigator />
          <Toast ref={(ref: any) => Toast.setRef(ref)} />
        </ThemeProvider>
      </AuthProvider>
    </APIProvider>
  );
};

export default App;
