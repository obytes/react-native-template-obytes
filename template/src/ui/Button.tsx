import React from 'react';
import type { PressableProps } from 'react-native';
import { Pressable } from 'react-native';
import { ActivityIndicator } from 'react-native';

import { Text, View } from './core';

interface Props extends PressableProps {
  variant?: keyof typeof buttonsVariants;
  label?: string;
  loading?: boolean;
}

export const Button = ({
  label,
  loading = false,
  variant = 'primary',
  ...props
}: Props) => {
  return (
    <Pressable {...props}>
      <View
        className={`
        my-2 flex-row items-center justify-center rounded-lg p-4
        ${buttonsVariants.defaults.container}
         ${buttonsVariants[variant].container}
        `}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            className={`
          ${buttonsVariants.defaults.label}
           ${buttonsVariants[variant].label}
          `}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

const buttonsVariants = {
  defaults: {
    container: 'px-12 py-3  border border-primary-600 rounded ',
    label: 'text-sm font-medium text-white',
  },
  primary: {
    container: 'bg-primary-600',
    label: '',
  },
  secondary: {
    container: 'bg-white ',
    label: 'text-secondary-600',
  },
  outline: {
    container: 'bg-white',
    label: 'text-primary-600',
  },
};
