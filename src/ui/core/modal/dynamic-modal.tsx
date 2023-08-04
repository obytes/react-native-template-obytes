import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  BottomSheetView,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import * as React from 'react';

import { Modal } from './modal';
import type { ModalProps } from './types';

// can't accept children as function because we can't pass ref to function component
type DynamicModalProps = Omit<ModalProps, 'children'> & {
  children: React.ReactNode;
};

export const DynamicModal = React.forwardRef(
  (
    { snapPoints = ['CONTENT_HEIGHT'], children, ...props }: DynamicModalProps,
    ref: React.ForwardedRef<BottomSheetModal>
  ) => {
    const bottomSheetRef = React.useRef<BottomSheetModal>(null);
    const {
      animatedHandleHeight,
      animatedSnapPoints,
      animatedContentHeight,
      handleContentLayout,
    } = useBottomSheetDynamicSnapPoints(snapPoints as Array<number | string>); // cast to remove shared values type

    React.useImperativeHandle(
      ref,
      () => (bottomSheetRef.current as BottomSheetModal) || null
    );

    return (
      <Modal
        {...props}
        ref={bottomSheetRef}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
      >
        <BottomSheetView onLayout={handleContentLayout}>
          {children}
        </BottomSheetView>
      </Modal>
    );
  }
);
