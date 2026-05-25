import type { Currency } from '@/lib/database/repositories/_shared/types';

import { Stack, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { useCallback, useRef, useState } from 'react';

import { ScrollView, Text, View } from '@/components/ui';
import { useDatabase } from '@/lib/database/provider';
import { CurrencyRow } from './components/currency-row';

type Props = {
  BottomSheet?: React.ComponentType<{
    currency: Currency | null;
    defaultCurrency: Currency | null;
    onAction: () => void;
    sheetRef: React.RefObject<any>;
  }>;
};

export function CurrenciesScreen({ BottomSheet }: Props) {
  const { currencies } = useDatabase();
  const [enabledList, setEnabledList] = useState<Currency[]>([]);
  const [availableList, setAvailableList] = useState<Currency[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const sheetRef = useRef<any>(null);

  const reload = useCallback(() => {
    const all = currencies.findAll();
    setEnabledList(all.filter(c => c.isEnabled === 1));
    setAvailableList(all.filter(c => c.isEnabled === 0));
    setDefaultCurrency(currencies.findDefault() ?? null);
  }, [currencies]);

  useFocusEffect(reload);

  const handlePress = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
    sheetRef.current?.present();
  }, []);

  const defaultCode = defaultCurrency?.code ?? '';

  return (
    <>
      <Stack.Screen options={{ title: 'Monedas' }} />
      <ScrollView className="flex-1">
        {enabledList.length > 0 && (
          <View className="border-t-2 border-neutral-200 dark:border-neutral-700">
            <View className="border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Text className="text-xs font-bold tracking-widest text-neutral-600 uppercase dark:text-neutral-400">
                Habilitadas
              </Text>
            </View>
            {enabledList.map(c => (
              <CurrencyRow key={c.id} currency={c} defaultCurrencyCode={defaultCode} onPress={() => handlePress(c)} />
            ))}
          </View>
        )}

        {availableList.length > 0 && (
          <View className="mt-4 border-t-2 border-neutral-200 dark:border-neutral-700">
            <View className="border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Text className="text-xs font-bold tracking-widest text-neutral-600 uppercase dark:text-neutral-400">
                Disponibles
              </Text>
            </View>
            {availableList.map(c => (
              <CurrencyRow key={c.id} currency={c} defaultCurrencyCode={defaultCode} onPress={() => handlePress(c)} />
            ))}
          </View>
        )}
      </ScrollView>

      {BottomSheet && (
        <BottomSheet
          currency={selectedCurrency}
          defaultCurrency={defaultCurrency}
          onAction={reload}
          sheetRef={sheetRef}
        />
      )}
    </>
  );
}
