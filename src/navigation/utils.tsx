import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  const enabledRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      if (enabledRef.current) {
        refetch();
      } else {
        enabledRef.current = true;
      }
    }, [refetch])
  );
}
