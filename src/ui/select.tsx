import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';
import { Pressable, type PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';

import colors from '@/ui/colors';
import { CaretDown } from '@/ui/icons';

import type { InputControllerType } from './input';
import { useModal } from './modal';
import { Modal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-4',
    label: 'text-grey-100 dark:text-neutral-100 text-lg mb-1',
    input:
      'mt-0 flex-row items-center justify-center border-[0.5px] border-grey-50 px-3 py-3  rounded-xl',
    inputValue: 'dark:text-neutral-100',
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
        label: 'text-danger-600 dark:text-danger-600',
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

export type Option = { label: string; value: string | number };

type OptionsProps = {
  options: Option[];
  onSelect: (option: Option) => void;
  value?: string | number;
};

function keyExtractor(item: Option) {
  return `select-item-${item.value}`;
}

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect, value }, ref) => {
    const height = options.length * 70 + 100;
    const snapPoints = React.useMemo(() => [height], [height]);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const renderSelectItem = React.useCallback(
      ({ item }: { item: Option }) => (
        <Option
          key={`select-item-${item.value}`}
          label={item.label}
          selected={value === item.value}
          onPress={() => onSelect(item)}
        />
      ),
      [onSelect, value]
    );

    return (
      <Modal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: isDark ? colors.charcoal[800] : colors.white,
        }}
      >
        <BottomSheetFlatList
          data={options}
          keyExtractor={keyExtractor}
          renderItem={renderSelectItem}
        />
      </Modal>
    );
  }
);

const Option = React.memo(
  ({
    label,
    selected = false,
    ...props
  }: PressableProps & {
    selected?: boolean;
    label: string;
  }) => {
    return (
      <Pressable
        className="flex-row items-center border-b-[1px] border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
        {...props}
      >
        <Text className="flex-1 dark:text-neutral-100 ">{label}</Text>
        {selected && <Check fill="#000" />}
      </Pressable>
    );
  }
);

export interface SelectProps {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  error?: string;
  options?: Option[];
  onSelect?: (value: string | number) => void;
  placeholder?: string;
}
interface ControlledSelectProps<T extends FieldValues>
  extends SelectProps,
    InputControllerType<T> {}

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
          <CaretDown />
        </TouchableOpacity>
        {error && (
          <Text className="text-sm text-danger-300 dark:text-danger-600">
            {error}
          </Text>
        )}
      </View>
      <Options ref={modal.ref} options={options} onSelect={onSelectOption} />
    </>
  );
};

// only used with react-hook-form
export function ControlledSelect<T extends FieldValues>(
  props: ControlledSelectProps<T>
) {
  const { name, control, rules, onSelect: onNSelect, ...selectProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  const onSelect = React.useCallback(
    (value: string | number) => {
      field.onChange(value);
      onNSelect?.(value);
    },
    [field, onNSelect]
  );
  return (
    <Select
      onSelect={onSelect}
      value={field.value}
      error={fieldState.error?.message}
      {...selectProps}
    />
  );
}

const Check = ({ fill = '#000', ...props }: SvgProps) => (
  <Svg width={25} height={24} fill="none" viewBox="0 0 25 24" {...props}>
    <Path
      d="m20.256 6.75-10.5 10.5L4.506 12"
      stroke={fill}
      strokeWidth={2.438}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
