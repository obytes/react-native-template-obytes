import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { CaretDown } from '@/ui/icons';
import colors from '@/ui/theme/colors';

import { useModal } from '../modal';
import { Text } from '../text';
import type { Option } from './options';
import { Options } from './options';

const selectTv = tv({
  slots: {
    container: 'mb-4',
    label: 'text-grey-100 dark:text-charcoal-100 text-sm',
    input:
      'mt-0 flex-row items-center justify-center border-[0.5px] border-grey-50 px-3 py-3  rounded-xl',
    inputValue: 'dark:text-charcoal-100',
  },

  variants: {
    focused: {
      true: {
        input: 'border-neutral-600',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600',
        inputValue: 'text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

export interface SelectProps {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  error?: string;
  options?: Option[];
  onSelect?: (value: string | number) => void;
  placeholder?: string;
}

export const Select = (props: SelectProps) => {
  const {
    label,
    value,
    error,
    options = [],
    placeholder = 'select...',
    disabled = false,
    onSelect,
  } = props;
  const modal = useModal();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const onSelectOption = React.useCallback(
    (option: Option) => {
      onSelect?.(option.value);
      modal.dismiss();
    },
    [modal, onSelect]
  );

  const styles = React.useMemo(
    () =>
      selectTv({
        error: Boolean(error),
        disabled,
      }),
    [error, disabled]
  );

  const textValue = React.useMemo(
    () =>
      value !== undefined
        ? options?.filter((t) => t.value === value)?.[0]?.label ?? placeholder
        : placeholder,
    [value, options, placeholder]
  );

  return (
    <>
      <View className={styles.container()}>
        {label && <Text className={styles.label()}>{label}</Text>}
        <TouchableOpacity
          className={styles.input()}
          disabled={disabled}
          onPress={modal.present}
        >
          <View className="flex-1">
            <Text className={styles.inputValue()}>{textValue}</Text>
          </View>
          <CaretDown color={isDark ? colors.white : colors.black} />
        </TouchableOpacity>
        {error && <Text className="text-sm text-danger-300">{error}</Text>}
      </View>
      <Options ref={modal.ref} options={options} onSelect={onSelectOption} />
    </>
  );
};
