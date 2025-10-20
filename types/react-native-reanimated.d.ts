import 'react-native-reanimated';

declare module 'react-native-reanimated/lib/typescript/Animated' {
  export type EasingFunction = import('react-native-reanimated').EasingFunction;
}
