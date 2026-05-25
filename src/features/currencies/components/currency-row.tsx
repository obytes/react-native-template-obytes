import type { Currency } from '@/lib/database/repositories/_shared/types';

import { Pressable, Text, View } from '@/components/ui';

type Props = {
  currency: Currency;
  defaultCurrencyCode: string;
  onPress: () => void;
};

export function CurrencyRow({ currency, defaultCurrencyCode, onPress }: Props) {
  const isDefault = currency.isDefault === 1;
  const isEnabled = currency.isEnabled === 1;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <View>
        <View className="flex-row items-center gap-2">
          <Text className="font-semibold dark:text-neutral-100">
            {currency.code}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {currency.name}
            {' '}
            ·
            {currency.symbol}
          </Text>
          {isDefault && (
            <View className="rounded-full bg-green-100 px-2 py-0.5 dark:bg-green-900">
              <Text className="text-xs font-bold text-green-700 dark:text-green-300">
                PRINCIPAL
              </Text>
            </View>
          )}
        </View>
        {isEnabled && !isDefault && (
          <Text className="text-xs text-neutral-400">
            1
            {' '}
            {defaultCurrencyCode}
            {' '}
            =
            {' '}
            {currency.exchangeRate.toFixed(4)}
            {' '}
            {currency.code}
          </Text>
        )}
      </View>
      <Text className="text-neutral-400">›</Text>
    </Pressable>
  );
}
