import type { Account, AccountCategory, Currency } from '@/lib/database/repositories/_shared/types';

import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { useCallback, useState } from 'react';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { toDefaultCurrency } from '@/lib/currency/conversion';
import { useDatabase } from '@/lib/database/provider';

type AccountRowProps = {
  account: Account;
  currency: Currency | undefined;
  onPress: () => void;
  balanceClassName: string;
};

function AccountRow({ account, currency, onPress, balanceClassName }: AccountRowProps) {
  const symbol = currency?.symbol ?? '';
  const code = currency?.code ?? '';
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <View>
        <Text className="font-medium dark:text-neutral-100">{account.name}</Text>
        <Text className={`text-xs ${account.status === 'active' ? 'text-green-600' : 'text-neutral-400'}`}>
          {account.status === 'active' ? 'Activa' : 'Inactiva'}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-semibold ${balanceClassName}`}>
          {symbol}
          {account.currentBalance.toFixed(2)}
          {' '}
          <Text className="text-xs text-neutral-400">{code}</Text>
        </Text>
        <Text className="text-xs text-neutral-400">
          Inicial:
          {' '}
          {symbol}
          {account.initialBalance.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

type SectionHeaderProps = {
  label: string;
  total: number;
  defaultCurrency: Currency | undefined;
};

function SectionHeader({ label, total, defaultCurrency }: SectionHeaderProps) {
  const symbol = defaultCurrency?.symbol ?? '';
  const code = defaultCurrency?.code ?? '';
  return (
    <View className="flex-row justify-between border-t-2 border-b border-neutral-200 border-t-neutral-300 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:border-t-neutral-600 dark:bg-neutral-800">
      <Text className="text-xs font-bold tracking-widest text-neutral-700 uppercase dark:text-neutral-300">
        {label}
      </Text>
      <Text className="text-xs text-neutral-500">
        {symbol}
        {total.toFixed(2)}
        {' '}
        {code}
      </Text>
    </View>
  );
}

export function AccountsScreen() {
  const { accounts, accountCategories, currencies } = useDatabase();
  const router = useRouter();
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [categoryList, setCategoryList] = useState<AccountCategory[]>([]);
  const [currencyMap, setCurrencyMap] = useState<Map<string, Currency>>(new Map());
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      setAccountList(accounts.findAll());
      setCategoryList(accountCategories.findAll());
      const all = currencies.findAll();
      setCurrencyMap(new Map(all.map(c => [c.id, c])));
      setDefaultCurrency(currencies.findDefault());
    }, [accounts, accountCategories, currencies]),
  );

  const activoCategories = categoryList.filter(c => c.type === 'activo');
  const pasivoCategories = categoryList.filter(c => c.type === 'pasivo');

  const getAccountsForCategory = (categoryId: string) =>
    accountList.filter(a => a.accountCategoryId === categoryId);

  const totalForType = (type: 'activo' | 'pasivo') => {
    const ids = new Set(categoryList.filter(c => c.type === type).map(c => c.id));
    return accountList
      .filter(a => ids.has(a.accountCategoryId))
      .reduce((sum, a) => {
        const currency = currencyMap.get(a.currencyId);
        if (!currency)
          return sum;
        return sum + toDefaultCurrency(a.currentBalance, currency.exchangeRate);
      }, 0);
  };

  const renderCategoryGroup = (cat: AccountCategory, balanceClassName: string) => (
    <React.Fragment key={cat.id}>
      <View className="border-b border-neutral-100 bg-neutral-50 px-4 py-1 dark:border-neutral-800 dark:bg-neutral-900">
        <Text className="text-xs text-neutral-400 italic">{cat.name}</Text>
      </View>
      {getAccountsForCategory(cat.id).map(account => (
        <AccountRow
          key={account.id}
          account={account}
          currency={currencyMap.get(account.currencyId)}
          onPress={() => router.push(`/cuentas/${account.id}`)}
          balanceClassName={balanceClassName}
        />
      ))}
    </React.Fragment>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cuentas',
          headerRight: () => (
            <Pressable onPress={() => router.push('/cuentas/nueva')}>
              <Text className="px-3 text-lg text-primary-300">+</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1">
        <SectionHeader
          label="Activos"
          total={totalForType('activo')}
          defaultCurrency={defaultCurrency}
        />
        {activoCategories.map(cat => renderCategoryGroup(cat, 'text-green-600'))}

        <SectionHeader
          label="Pasivos"
          total={totalForType('pasivo')}
          defaultCurrency={defaultCurrency}
        />
        {pasivoCategories.map(cat => renderCategoryGroup(cat, 'text-danger-600'))}

        <Pressable
          onPress={() => router.push('/cuentas/categorias')}
          className="mt-2 flex-row items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-700"
        >
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Gestionar categorías
          </Text>
          <Text className="text-neutral-400">›</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
