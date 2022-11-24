import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

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
  const optionsRef = React.useRef<BottomSheetModal>(null);
  const open = React.useCallback(() => optionsRef.current?.present(), []);
  const close = React.useCallback(() => optionsRef.current?.dismiss(), []);

  const onSelectOption = React.useCallback(
    (option: Option) => {
      onSelect?.(option.value);
      close();
    },
    [close, onSelect]
  );

  const borderColor = error ? 'border-danger-600' : 'border-neutral-400';

  const bgColor = error ? 'bg-danger-50' : 'bg-neutral-200';

  const textValue =
    value !== undefined
      ? options?.filter((t) => t.value === value)?.[0]?.label ?? placeholder
      : placeholder;
  return (
    <>
      <View className="mb-4">
        {label && (
          <Text
            variant="md"
            className={error ? 'text-danger-600' : 'text-black'}
          >
            {label}
          </Text>
        )}
        <TouchableOpacity
          className={`mt-0 flex-row items-center justify-center border-[1px] py-3 px-2  ${borderColor} rounded-md ${bgColor} text-[16px]`}
          disabled={disabled}
          onPress={open}
        >
          <View className="flex-1">
            <Text variant="md" className="text-neutral-600">
              {textValue}
            </Text>
          </View>
          <Arrow />
        </TouchableOpacity>
        {error && <Text variant="error">{error}</Text>}
      </View>
      <Options ref={optionsRef} options={options} onSelect={onSelectOption} />
    </>
  );
};
