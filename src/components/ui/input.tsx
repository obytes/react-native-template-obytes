import type { TextInputProps } from 'react-native';
import * as React from 'react';
import { I18nManager, TextInput as NTextInput, StyleSheet, View } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { Text } from './text';

/**
 * Design V2 form field (S13-01 §7, Figma "Form Fields").
 * - `light` (default): in-app forms. White fill, hairline border, navy focus border.
 * - `dark`: on navy (login). White @8% fill, white @18% border, lilac when focused.
 * r8, 16pt padding. `FormField` is the same component under its V2 name.
 */
const inputTv = tv({
  slots: {
    container: 'mb-2',
    label: 'mb-1.5 font-sans-medium text-xs/4',
    input: 'mt-0 rounded-lg border p-4 font-sans-medium text-sm/5',
  },

  variants: {
    tone: {
      light: {
        label: 'text-ink-variant',
        input: 'border-outline-variant bg-white text-ink',
      },
      dark: {
        label: 'text-on-primary-container',
        input: 'border-white/18 bg-white/8 text-white',
      },
    },
    focused: {
      true: {},
    },
    error: {
      true: {
        input: 'border-danger-500',
        label: 'text-danger-700',
      },
    },
    disabled: {
      true: {
        input: 'opacity-50',
      },
    },
  },
  compoundVariants: [
    { tone: 'light', focused: true, error: false, class: { input: 'border-primary' } },
    { tone: 'dark', focused: true, error: false, class: { input: 'border-on-primary-container' } },
  ],
  defaultVariants: {
    tone: 'light',
    focused: false,
    error: false,
    disabled: false,
  },
});

export type InputTone = 'light' | 'dark';

export type NInputProps = {
  label?: string;
  disabled?: boolean;
  error?: string;
  tone?: InputTone;
} & TextInputProps;

export function Input({ ref, ...props }: NInputProps & { ref?: React.Ref<NTextInput | null> }) {
  const { label, error, tone = 'light', testID, onBlur: onBlurProp, onFocus: onFocusProp, ...inputProps } = props;
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
    tone,
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
        placeholderTextColor={tone === 'dark' ? colors.primaryFixed : colors.inkMuted}
        editable={!props.disabled}
        accessibilityLabel={label}
        accessibilityState={{ disabled: Boolean(props.disabled) }}
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
          className={tone === 'dark' ? 'mt-1 text-xs text-danger-300' : 'mt-1 text-xs text-danger-700'}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

/** Design V2 name for the form field. Same component and props as `Input`. */
export const FormField = Input;
