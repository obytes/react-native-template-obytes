import type { BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { View } from '../view';
import { renderBackdrop } from './modal-backdrop';
import { ModalHeader } from './modal-header';
import type { ModalProps } from './types';

export const Modal = React.forwardRef(
  (
    {
      snapPoints: _snapPoints = ['60%'],
      title,
      detached = false,
      ...props
    }: ModalProps,
    ref: React.ForwardedRef<BottomSheetModal>
  ) => {
    const detachedProps = React.useMemo(
      () => getDetachedProps(detached),
      [detached]
    );
    const bottomSheetRef = React.useRef<BottomSheetModal>(null);
    const snapPoints = React.useMemo(() => _snapPoints, [_snapPoints]);

    const dismiss = React.useCallback(() => {
      bottomSheetRef.current?.dismiss();
    }, []);

    React.useImperativeHandle(
      ref,
      () => (bottomSheetRef.current as BottomSheetModal) || null
    );

    const renderHandleComponent = React.useCallback(
      () => (
        <>
          <View className="mt-2 h-1 w-12 self-center rounded-lg bg-gray-400 dark:bg-gray-700" />
          <ModalHeader title={title} dismiss={dismiss} />
        </>
      ),
      [title, dismiss]
    );

    return (
      <BottomSheetModal
        {...props}
        {...detachedProps}
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={props.backdropComponent || renderBackdrop}
        handleComponent={renderHandleComponent}
      />
    );
  }
);

const getDetachedProps = (detached: boolean) => {
  if (detached) {
    return {
      detached: true,
      bottomInset: 46,
      style: { marginHorizontal: 16, overflow: 'hidden' },
    } as Partial<BottomSheetModalProps>;
  }
  return {} as Partial<BottomSheetModalProps>;
};
