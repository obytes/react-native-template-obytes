import { Env } from '@env';
import type { AxiosError } from 'axios';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';

import { SafeAreaView, Text, View } from './core';
// for onError react queries and mutations
export const showError = (error: AxiosError) => {
  console.log(JSON.stringify(error?.response?.data));
  const description = extractError(error?.response?.data).trimEnd();

  showMessage({
    message: 'Error',
    description,
    type: 'danger',
    duration: 4000,
    icon: 'danger',
  });
};

export const showErrorMessage = (message: string = 'Something went wrong ') => {
  showMessage({
    message,
    type: 'danger',
    duration: 4000,
  });
};

export const extractError = (data: unknown): string => {
  if (typeof data === 'string') {
    return data;
  }
  if (Array.isArray(data)) {
    const messages = data.map((item) => {
      return `  ${extractError(item)}`;
    });

    return `${messages.join('')}`;
  }

  if (typeof data === 'object' && data !== null) {
    const messages = Object.entries(data).map((item) => {
      const [key, value] = item;
      const separator = Array.isArray(value) ? ':\n ' : ': ';

      return `- ${key}${separator}${extractError(value)} \n `;
    });
    return `${messages.join('')} `;
  }
  return 'Something went wrong ';
};

export const VersionBanner = () => {
  const { colorScheme } = useColorScheme();
  const bgColor = colorScheme === 'dark' ? 'bg-black' : 'bg-white';
  return (
    <>
      {Env.APP_ENV !== 'production' ? (
        <SafeAreaView className={bgColor}>
          <View className="h-10 justify-center bg-red-500">
            <Text variant="md" className="text-center text-white">
              v {Env.VERSION}
            </Text>
          </View>
        </SafeAreaView>
      ) : null}
    </>
  );
};
