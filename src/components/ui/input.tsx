import type { TextInputProps } from 'react-native';
import * as React from 'react';
import { I18nManager, TextInput as NTextInput, StyleSheet, View } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { Text } from './text';

const inputTv = tv({
  slots: {
    container: 'mb-2',
    label: 'mb-1 text-lg text-ink-variant',
    input:
      'mt-0 rounded-xl border-[0.5px] border-outline-variant bg-surface px-4 py-3 font-sans text-base/5 font-medium',
  },

  variants: {
    focused: {
      true: {
        input: 'border-outline-variant',
      },
    },
    error: {
      true: {
        input: 'border-danger-500',
        label: 'text-danger-700',
      },
    },
    disabled: {
      true: {
        input: 'bg-secondary-container',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export type NInputProps = {
  label?: string;
  disabled?: boolean;
  error?: string;
} & TextInputProps;

export function Input({ ref, ...props }: NInputProps & { ref?: React.Ref<NTextInput | null> }) {
  const { label, error, testID, onBlur: onBlurProp, onFocus: onFocusProp, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);

  const onBlur = React.useCallback(
    (e: any) => {
      setIsFocussed(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );

  const onFocus = React.useCallback(
    (e: any) => {
      setIsFocussed(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );

  const styles = inputTv({
    error: Boolean(error),
    focused: isFocussed,
    disabled: Boolean(props.disabled),
  });

  return (
    <View className={styles.container()}>
      {label && (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={styles.label()}
        >
          {label}
        </Text>
      )}
      <NTextInput
        testID={testID}
        ref={ref}
        placeholderTextColor={colors.inkMuted}
        className={styles.input()}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
        style={StyleSheet.flatten([
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          { textAlign: I18nManager.isRTL ? 'right' : 'left' },
          inputProps.style,
        ])}
      />
      {error && (
        <Text
          testID={testID ? `${testID}-error` : undefined}
          className="text-sm text-danger-500"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
