import type {
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';

export type ModalProps = BottomSheetModalProps & {
  title?: string;
};

// can't accept children as function because we can't pass ref to function component
export type DynamicModalProps = Omit<ModalProps, 'children' | 'snapPoints'> & {
  children: React.ReactNode;
  snapPoints?: Array<number | string>;
};

export type ModalRef = React.ForwardedRef<BottomSheetModal>;
