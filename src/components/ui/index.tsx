/* eslint-disable react-refresh/only-export-components */
import Svg from 'react-native-svg';
import { withUniwind } from 'uniwind';

export * from './activity-indicator';
export * from './avatar';
export * from './button';
export * from './card';
export * from './checkbox';
export * from './chip';
export { default as colors } from './colors';
export * from './dots';
export * from './empty-state';
export * from './focus-aware-status-bar';
export * from './gradient';
export * from './gradient-styles';
export * from './hit-slop';
export * from './icon-button';
export * from './image';
export * from './initials';
export * from './input';
export * from './list';
export * from './list-row';
export * from './modal';
export * from './mono-label';
export * from './photo-fallback';
export * from './progress-bar';
export * from './screen-header';
export * from './select';
export * from './text';
export * from './text-variants';
export * from './utils';

// export base components from react-native
export {
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

// Apply withUniwind to Svg to add className support
export const StyledSvg = withUniwind(Svg);
