import { FlashList as NFlashList } from '@shopify/flash-list';
import { styled } from 'nativewind';

export * from './empty-list';

export const List = styled(NFlashList, {
  classProps: ['contentContainerStyle', 'className'],
});
