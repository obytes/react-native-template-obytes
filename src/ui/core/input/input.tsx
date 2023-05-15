import { styled, useColorScheme } from 'nativewind';
import * as React from 'react';
import type { TextInput, TextInputProps } from 'react-native';
import { StyleSheet } from 'react-native';
import { TextInput as NTextInput } from 'react-native';

import { isRTL } from '@/core';

import colors from '../../theme/colors';
import { Text } from '../text';
import { View } from '../view';

const STextInput = styled(NTextInput);

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
}

export const Input = React.forwardRef<TextInput, NInputProps>((props, ref) => {
  const { label, error, ...inputProps } = props;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocussed, setIsFocussed] = React.useState(false);
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const borderColor = error
    ? 'border-danger-600'
    : isFocussed
    ? isDark
      ? 'border-white'
      : 'border-neutral-600'
    : isDark
    ? 'border-charcoal-700'
    : 'border-neutral-400';

  const bgColor = isDark
    ? 'bg-charcoal-800'
    : error
    ? 'bg-danger-50'
    : 'bg-neutral-200';
  const textDirection = isRTL ? 'text-right' : 'text-left';
  return (
    <View className="mb-4">
      {label && (
        <Text
          variant="md"
          className={
            error
              ? 'text-danger-600'
              : isDark
              ? 'text-charcoal-100'
              : 'text-black'
          }
        >
          {label}
        </Text>
      )}
      <STextInput
        testID="STextInput"
        ref={ref}
        placeholderTextColor={colors.neutral[400]}
        className={`mt-0 border-[1px] py-4 px-2  ${borderColor} rounded-md ${bgColor} text-[16px] ${textDirection} dark:text-charcoal-100`}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
        style={StyleSheet.flatten([
          { writingDirection: isRTL ? 'rtl' : 'ltr' },
        ])}
      />
      {error && <Text variant="error">{error}</Text>}
    </View>
  );
});
