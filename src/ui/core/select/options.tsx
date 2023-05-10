import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { type PressableProps } from 'react-native';

import { colors } from '@/ui/theme';

import { renderBackdrop } from '../bottom-sheet';
import { Pressable } from '../pressable';
import { Text } from '../text';
import { Check } from './icons';

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
          isDark={isDark}
        />
      ),
      [onSelect, value, isDark]
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: isDark ? colors.white : colors.night.screen,
        }}
        backgroundStyle={{
          backgroundColor: isDark ? colors.night.screen : colors.white,
        }}
      >
        <BottomSheetFlatList
          data={options}
          keyExtractor={keyExtractor}
          renderItem={renderSelectItem}
          style={{
            backgroundColor: isDark ? colors.night.screen : colors.white,
          }}
        />
      </BottomSheetModal>
    );
  }
);

const Option = ({
  label,
  selected = false,
  isDark = false,
  ...props
}: PressableProps & {
  selected?: boolean;
  label: string;
  isDark?: boolean;
}) => {
  return (
    <Pressable
      className="flex-row items-center border-b-[1px] border-neutral-300 bg-white py-2 px-3 dark:border-night-border dark:bg-night-card"
      {...props}
    >
      <Text variant="md" className="flex-1 dark:text-night-text">
        {label}
      </Text>
      {selected && <Check color={isDark ? colors.white : colors.black} />}
    </Pressable>
  );
};
