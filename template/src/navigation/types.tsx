import type { RouteProp } from '@react-navigation/native';

import type { AuthStackParamList } from './auth-navigator';

export type RootStackParamList = AuthStackParamList;
// very important to type check useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootNavList<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
