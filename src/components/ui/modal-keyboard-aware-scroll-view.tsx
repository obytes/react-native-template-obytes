/**
 * This component is used to handle the keyboard in a modal.
 * It is a wrapper around the ScrollView component with keyboard handling.
 * example usage:
      export function Example() {
        return (
          <Modal>
            <BottomSheetKeyboardAwareScrollView>
            </BottomSheetKeyboardAwareScrollView>
          </Modal>
        );
        }
 */
import {
  type BottomSheetScrollViewMethods,
  createBottomSheetScrollableComponent,
  SCROLLABLE_TYPE,
} from '@gorhom/bottom-sheet';
import { type BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/src/components/bottomSheetScrollable/types';
import { memo } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import Reanimated from 'react-native-reanimated';

const AnimatedScrollView =
  Reanimated.createAnimatedComponent<ScrollViewProps>(ScrollView);
const BottomSheetScrollViewComponent = createBottomSheetScrollableComponent<
  BottomSheetScrollViewMethods,
  BottomSheetScrollViewProps
>(SCROLLABLE_TYPE.SCROLLVIEW, AnimatedScrollView);
const BottomSheetKeyboardAwareScrollView = memo(BottomSheetScrollViewComponent);

BottomSheetKeyboardAwareScrollView.displayName =
  'BottomSheetKeyboardAwareScrollView';

export default BottomSheetKeyboardAwareScrollView as (
  props: BottomSheetScrollViewProps & ScrollViewProps
) => ReturnType<typeof BottomSheetKeyboardAwareScrollView>;
