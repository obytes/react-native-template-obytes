/**
 * @format
 */

import 'react-native';
import React from 'react';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {View} from 'react-native';

const App = () => <View />;

it('renders correctly', () => {
  renderer.create(<App />);
});
