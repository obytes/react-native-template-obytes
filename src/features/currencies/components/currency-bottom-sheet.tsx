import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Currency } from '@/lib/database/repositories/_shared/types';

import * as React from 'react';
import { Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { Button, Input, showErrorMessage, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { useDatabase } from '@/lib/database/provider';

type Props = {
  currency: Currency | null;
  defaultCurrency: Currency | null;
  onAction: () => void;
  sheetRef: React.RefObject<BottomSheetModal>;
};

function DefaultCurrencyContent({ currency }: { currency: Currency }) {
  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold dark:text-white">
          {currency.symbol}
          {' '}
          {currency.code}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {currency.name}
        </Text>
        <View className="mt-2 self-start rounded-full bg-green-100 px-3 py-1 dark:bg-green-900">
          <Text className="text-xs font-bold text-green-700 dark:text-green-300">
            Moneda principal
          </Text>
        </View>
      </View>
      <Text className="text-sm text-neutral-500 italic dark:text-neutral-400">
        Esta es la moneda principal. El tipo de cambio siempre es 1.
      </Text>
    </View>
  );
}

function DisabledCurrencyContent({
  currency,
  onEnable,
}: {
  currency: Currency;
  onEnable: () => void;
}) {
  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-neutral-400 dark:text-neutral-500">
          {currency.symbol}
          {' '}
          {currency.code}
        </Text>
        <Text className="text-sm text-neutral-400">{currency.name}</Text>
        <View className="mt-2 self-start rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
          <Text className="text-xs text-neutral-500">Deshabilitada</Text>
        </View>
      </View>
      <Button label="Habilitar moneda" onPress={onEnable} />
    </View>
  );
}

function EnabledCurrencyContent({
  currency,
  defaultCurrency,
  onSetDefault,
  onDisable,
  onSaveRate,
}: {
  currency: Currency;
  defaultCurrency: Currency | null;
  onSetDefault: () => void;
  onDisable: () => void;
  onSaveRate: (rate: number) => void;
}) {
  const [rateText, setRateText] = React.useState(
    currency.exchangeRate.toFixed(4),
  );

  const defaultCode = defaultCurrency?.code ?? 'BOB';

  return (
    <View className="p-4">
      <View className="mb-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <Text className="text-2xl font-bold dark:text-white">
          {currency.symbol}
          {' '}
          {currency.code}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {currency.name}
        </Text>
        <View className="mt-2 self-start rounded-full bg-green-50 px-3 py-1 dark:bg-green-950">
          <Text className="text-xs text-green-700 dark:text-green-400">
            Habilitada
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-xs font-bold tracking-widest text-neutral-500 uppercase">
          Tipo de cambio
        </Text>
        <Text className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
          1
          {' '}
          {defaultCode}
          {' '}
          equivale a
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              keyboardType="decimal-pad"
              value={rateText}
              onChangeText={setRateText}
            />
          </View>
          <Text className="font-semibold text-neutral-700 dark:text-neutral-300">
            {currency.code}
          </Text>
        </View>
        <View className="mt-3">
          <Button
            label="Guardar tipo de cambio"
            onPress={() => {
              const rate = Number(rateText);
              if (!Number.isFinite(rate) || rate <= 0) {
                showErrorMessage('Ingresa un tipo de cambio válido mayor a 0');
                return;
              }
              onSaveRate(rate);
            }}
          />
        </View>
      </View>

      <View className="gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <Button
          label="Establecer como moneda principal"
          variant="outline"
          onPress={onSetDefault}
        />
        <Button
          label="Deshabilitar moneda"
          variant="destructive"
          onPress={onDisable}
        />
      </View>
    </View>
  );
}

export function CurrencyBottomSheet({ currency, defaultCurrency, onAction, sheetRef }: Props) {
  const { currencies } = useDatabase();

  const handleEnable = () => {
    if (!currency)
      return;
    try {
      currencies.enable(currency.id);
      showMessage({ message: 'Moneda habilitada', type: 'success' });
      onAction();
      sheetRef.current?.dismiss();
    }
    catch {
      showErrorMessage('Error al habilitar la moneda');
    }
  };

  const handleDisable = () => {
    if (!currency)
      return;
    try {
      currencies.disable(currency.id);
      showMessage({ message: 'Moneda deshabilitada', type: 'success' });
      onAction();
      sheetRef.current?.dismiss();
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Error al deshabilitar';
      showErrorMessage(message);
    }
  };

  const handleSetDefault = () => {
    if (!currency)
      return;
    Alert.alert(
      'Cambiar moneda principal',
      `¿Establecer ${currency.code} como moneda principal? Los totales de activos y pasivos se mostrarán en esta moneda.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            try {
              currencies.setDefault(currency.id);
              showMessage({ message: 'Moneda principal actualizada', type: 'success' });
              onAction();
              sheetRef.current?.dismiss();
            }
            catch {
              showErrorMessage('Error al cambiar la moneda principal');
            }
          },
        },
      ],
    );
  };

  const handleSaveRate = (rate: number) => {
    if (!currency)
      return;
    try {
      currencies.updateExchangeRate(currency.id, rate);
      showMessage({ message: 'Tipo de cambio actualizado', type: 'success' });
      onAction();
    }
    catch {
      showErrorMessage('Error al guardar el tipo de cambio');
    }
  };

  const renderContent = () => {
    if (!currency)
      return null;
    if (currency.isDefault === 1) {
      return <DefaultCurrencyContent currency={currency} />;
    }
    if (currency.isEnabled === 0) {
      return <DisabledCurrencyContent currency={currency} onEnable={handleEnable} />;
    }
    return (
      <EnabledCurrencyContent
        currency={currency}
        defaultCurrency={defaultCurrency}
        onSetDefault={handleSetDefault}
        onDisable={handleDisable}
        onSaveRate={handleSaveRate}
      />
    );
  };

  return (
    <Modal ref={sheetRef} snapPoints={['55%']} title={currency?.code ?? ''}>
      {renderContent()}
    </Modal>
  );
}
