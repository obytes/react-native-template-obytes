import { FlashList as NFlashList } from '@shopify/flash-list';
import { styled } from 'nativewind';

export const List = styled(NFlashList, {
  classProps: ['contentContainerStyle', 'className'],
});
