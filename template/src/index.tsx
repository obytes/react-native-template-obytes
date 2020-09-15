import React from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider, Toast} from 'ui';
import {RootNavigator} from 'navigation';
import {setI18nConfig, AuthProvider} from 'core';

setI18nConfig();

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
        <Toast ref={(ref: any) => Toast.setRef(ref)} />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
