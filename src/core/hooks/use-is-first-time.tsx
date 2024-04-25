import { Platform } from 'react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { storage } from '../storage';
import { webStorage } from '../storage.web';

const IS_FIRST_TIME = 'IS_FIRST_TIME';

export const useIsFirstTime = () => {
  const [isFirstTime, setIsFirstTime] = useMMKVBoolean(
    IS_FIRST_TIME,
    Platform.OS === 'web' ? webStorage : storage
  );
  if (isFirstTime === undefined) {
    return [true, setIsFirstTime] as const;
  }
  return [isFirstTime, setIsFirstTime] as const;
};
