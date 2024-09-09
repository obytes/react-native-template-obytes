import { View } from 'react-native';

module.exports = {
  ...require('@gorhom/bottom-sheet/mock'),
  SCROLLABLE_TYPE: {
    SCROLLVIEW: 'ScrollView',
  },
  createBottomSheetScrollableComponent: jest.fn(() => View),
};
