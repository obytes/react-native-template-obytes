import * as React from 'react';
import type { TextInput, TextInputProps } from 'react-native';
import { I18nManager, StyleSheet, View } from 'react-native';
import { TextInput as NTextInput } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from '../../theme/colors';
import { Text } from '../text';

const inputTv = tv({
  slots: {
    container: 'mb-2',
    label: 'text-grey-100 dark:text-charcoal-100 text-sm',
    input:
      'mt-0 border-[0.5px] font-jakarta text-base leading-5 font-[500] px-4 py-3 rounded-xl  bg-neutral-100 border-neutral-300 ',
  },

  variants: {
    focused: {
      true: {
        input: 'border-neutral-400',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    focused: false,
    error: false,
    disabled: false,
  },
});

export interface NInputProps extends TextInputProps {
  label?: string;
  disabled?: boolean;
  error?: string;
}

export const Input = React.forwardRef<TextInput, NInputProps>((props, ref) => {
  const { label, error, ...inputProps } = props;
  const [isFocussed, setIsFocussed] = React.useState(false);
  const onBlur = React.useCallback(() => setIsFocussed(false), []);
  const onFocus = React.useCallback(() => setIsFocussed(true), []);

  const styles = React.useMemo(
    () =>
      inputTv({
        error: Boolean(error),
        focused: isFocussed,
        disabled: Boolean(props.disabled),
      }),
    [error, isFocussed, props.disabled]
  );

  return (
    <View className={styles.container()}>
      {label && <Text className={styles.label()}>{label}</Text>}
      <NTextInput
        testID="NTextInput"
        ref={ref}
        placeholderTextColor={colors.neutral[400]}
        className={styles.input()}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
        style={StyleSheet.flatten([
          { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
          inputProps.style,
        ])}
      />
      {error && <Text className="text-sm text-danger-400">{error}</Text>}
    </View>
  );
});
