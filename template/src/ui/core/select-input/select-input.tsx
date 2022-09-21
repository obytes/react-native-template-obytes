import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import type { FieldError } from 'react-hook-form';

import { Text } from '../text';
import { TouchableOpacity } from '../touchable-opacity';
import { View } from '../view';
import { Arrow } from './arrow';
import type { Option } from './options';
import { Options } from './options';

export interface SelectInputProps {
  label?: string;
  disabled?: boolean;
  error?: Omit<FieldError, 'type'> | undefined;
  options?: Option[];
  onSelect?: (option: Option) => void;
  placeholder?: string;
}

export const SelectInput = (props: SelectInputProps) => {
  const {
    label,
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
      onSelect?.(option);
      close();
    },
    [close, onSelect]
  );

  const borderColor = error ? 'border-danger-600' : 'border-neutral-400';

  const bgColor = error ? 'bg-danger-50' : 'bg-neutral-200';
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
              {placeholder}
            </Text>
          </View>
          <Arrow />
        </TouchableOpacity>
        {error && <Text variant="error">{error.message}</Text>}
      </View>
      <Options ref={optionsRef} options={options} onSelect={onSelectOption} />
    </>
  );
};
