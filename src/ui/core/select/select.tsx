import { useColorScheme } from 'nativewind';
import * as React from 'react';

import colors from '@/ui/theme/colors';

import { useModal } from '../modal';
import { Text } from '../text';
import { TouchableOpacity } from '../touchable-opacity';
import { View } from '../view';
import { Arrow } from './icons';
import type { Option } from './options';
import { Options } from './options';

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

  const { borderColor, bgColor, valueColor, labelColor } = useColors(!!error);

  const textValue =
    value !== undefined
      ? options?.filter((t) => t.value === value)?.[0]?.label ?? placeholder
      : placeholder;

  return (
    <>
      <View className="mb-4">
        {label && (
          <Text variant="md" className={labelColor}>
            {label}
          </Text>
        )}
        <TouchableOpacity
          className={`mt-0 flex-row items-center justify-center border-[1px] py-3 px-2  ${borderColor} rounded-md ${bgColor} text-[16px]`}
          disabled={disabled}
          onPress={modal.present}
        >
          <View className="flex-1">
            <Text variant="md" className={valueColor}>
              {textValue}
            </Text>
          </View>
          <Arrow color={isDark ? colors.white : colors.black} />
        </TouchableOpacity>
        {error && <Text variant="error">{error}</Text>}
      </View>
      <Options ref={modal.ref} options={options} onSelect={onSelectOption} />
    </>
  );
};

const useColors = (error: boolean) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const borderColor = error
    ? 'border-danger-600'
    : isDark
    ? 'border-charcoal-700'
    : 'border-neutral-400';

  const bgColor = isDark
    ? 'bg-charcoal-800'
    : error
    ? 'bg-danger-50'
    : 'bg-neutral-200';

  const labelColor = error
    ? 'text-danger-600'
    : isDark
    ? 'text-charcoal-100'
    : 'text-black';

  const valueColor = error
    ? 'text-danger-600'
    : isDark
    ? 'text-charcoal-100'
    : 'text-neutral-600';

  return { borderColor, bgColor, labelColor, valueColor } as const;
};
