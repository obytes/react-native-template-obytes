import React from 'react';
import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import {ThemeProvider, Toast} from 'ui';
import {RootNavigator} from 'navigation';
import {setI18nConfig} from 'core';

setI18nConfig();

const App = () => {
  let init = async () => {
    // …do multiple async tasks
  };

  React.useEffect(() => {
    init().finally(() => {
      RNBootSplash.hide({fade: true});
    });
  }, []);

  return (
    <ThemeProvider>
      <RootNavigator />
      <Toast ref={(ref: any) => Toast.setRef(ref)} />
    </ThemeProvider>
  );
};

export default App;
