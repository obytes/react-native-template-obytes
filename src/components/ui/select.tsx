import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { PressableProps } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import {
  BottomSheetFlatList,

} from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';

import colors from '@/components/ui/colors';

import { CaretDown } from '@/components/ui/icons';
import { Modal, useModal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-4',
    label: 'mb-1 text-lg text-ink-variant',
    input:
      'mt-0 flex-row items-center justify-center rounded-xl border-[0.5px] border-outline-variant p-3',
    inputValue: '',
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
        inputValue: 'text-danger-700',
      },
    },
    disabled: {
      true: {
        input: 'bg-secondary-container',
      },
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

const List = Platform.OS === 'web' ? FlashList : BottomSheetFlatList;

export type OptionType = { label: string; value: string | number };

type OptionsProps = {
  options: OptionType[];
  onSelect: (option: OptionType) => void;
  value?: string | number;
  testID?: string;
};

function keyExtractor(item: OptionType) {
  return `select-item-${item.value}`;
}

export function Options({ ref, options, onSelect, value, testID }: OptionsProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const height = options.length * 70 + 100;
  const snapPoints = React.useMemo(() => [height], [height]);

  const renderSelectItem = React.useCallback(
    ({ item }: { item: OptionType }) => (
      <Option
        key={`select-item-${item.value}`}
        label={item.label}
        selected={value === item.value}
        onPress={() => onSelect(item)}
        testID={testID ? `${testID}-item-${item.value}` : undefined}
      />
    ),
    [onSelect, value, testID],
  );

  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: colors.white,
      }}
    >
      <List
        data={options}
        keyExtractor={keyExtractor}
        renderItem={renderSelectItem}
        testID={testID ? `${testID}-modal` : undefined}
        estimatedItemSize={52}
      />
    </Modal>
  );
}

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
        className="flex-row items-center border-b border-outline-variant bg-white px-3 py-2"
        {...props}
      >
        <Text className="flex-1">{label}</Text>
        {selected && <Check />}
      </Pressable>
    );
  },
);

export type SelectProps = {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  error?: string;
  options?: OptionType[];
  onSelect?: (value: string | number) => void;
  placeholder?: string;
  testID?: string;
};

export function Select(props: SelectProps) {
  const {
    label,
    value,
    error,
    options = [],
    placeholder = 'select...',
    disabled = false,
    onSelect,
    testID,
  } = props;
  const modal = useModal();

  const onSelectOption = React.useCallback(
    (option: OptionType) => {
      onSelect?.(option.value);
      modal.dismiss();
    },
    [modal, onSelect],
  );

  const styles = React.useMemo(
    () =>
      selectTv({
        error: Boolean(error),
        disabled,
      }),
    [error, disabled],
  );

  const textValue = React.useMemo(
    () =>
      value !== undefined
        ? (options?.filter(t => t.value === value)?.[0]?.label ?? placeholder)
        : placeholder,
    [value, options, placeholder],
  );

  return (
    <>
      <View className={styles.container()}>
        {label && (
          <Text
            testID={testID ? `${testID}-label` : undefined}
            className={styles.label()}
          >
            {label}
          </Text>
        )}
        <Pressable
          className={styles.input()}
          disabled={disabled}
          onPress={modal.present}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          <View className="flex-1">
            <Text className={styles.inputValue()}>{textValue}</Text>
          </View>
          <CaretDown />
        </Pressable>
        {error && (
          <Text
            testID={`${testID}-error`}
            className="text-sm text-danger-500"
          >
            {error}
          </Text>
        )}
      </View>
      <Options
        testID={testID}
        ref={modal.ref}
        options={options}
        onSelect={onSelectOption}
      />
    </>
  );
}

function Check({ ...props }: SvgProps) {
  return (
    <Svg
      width={25}
      height={24}
      fill="none"
      viewBox="0 0 25 24"
      {...props}
      className="stroke-ink"
    >
      <Path
        d="m20.256 6.75-10.5 10.5L4.506 12"
        strokeWidth={2.438}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
