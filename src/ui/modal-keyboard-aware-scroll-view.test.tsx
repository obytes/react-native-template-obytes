import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import BottomSheetKeyboardAwareScrollView from './modal-keyboard-aware-scroll-view';

describe('BottomSheetKeyboardAwareScrollView component', () => {
  it('renders correctly', () => {
    render(
      <BottomSheetKeyboardAwareScrollView testID="BottomSheetKeyboardAwareScrollView">
        <View />
      </BottomSheetKeyboardAwareScrollView>
    );
    expect(
      screen.getByTestId('BottomSheetKeyboardAwareScrollView')
    ).toBeTruthy();
  });
});
