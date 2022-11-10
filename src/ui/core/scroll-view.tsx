import { styled } from 'nativewind';
import { ScrollView as NScrollView } from 'react-native';

export const ScrollView = styled(NScrollView, {
  classProps: ['contentContainerStyle', 'className'],
});
