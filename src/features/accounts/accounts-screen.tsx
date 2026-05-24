import type { Account, AccountCategory } from '@/lib/database/repositories/_shared/types';

import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { useCallback, useState } from 'react';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { useDatabase } from '@/lib/database/provider';

type AccountRowProps = { account: Account; onPress: () => void; balanceClassName: string };

function AccountRow({ account, onPress, balanceClassName }: AccountRowProps) {
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
          $
          {account.currentBalance.toFixed(2)}
        </Text>
        <Text className="text-xs text-neutral-400">
          Inicial: $
          {account.initialBalance.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

type SectionHeaderProps = { label: string; total: number };

function SectionHeader({ label, total }: SectionHeaderProps) {
  return (
    <View className="flex-row justify-between border-t-2 border-b border-neutral-200 border-t-neutral-300 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:border-t-neutral-600 dark:bg-neutral-800">
      <Text className="text-xs font-bold tracking-widest text-neutral-700 uppercase dark:text-neutral-300">
        {label}
      </Text>
      <Text className="text-xs text-neutral-500">
        $
        {total.toFixed(2)}
      </Text>
    </View>
  );
}

export function AccountsScreen() {
  const { accounts, accountCategories } = useDatabase();
  const router = useRouter();
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [categoryList, setCategoryList] = useState<AccountCategory[]>([]);

  useFocusEffect(
    useCallback(() => {
      setAccountList(accounts.findAll());
      setCategoryList(accountCategories.findAll());
    }, [accounts, accountCategories]),
  );

  const activoCategories = categoryList.filter(c => c.type === 'activo');
  const pasivoCategories = categoryList.filter(c => c.type === 'pasivo');

  const getAccountsForCategory = (categoryId: string) =>
    accountList.filter(a => a.accountCategoryId === categoryId);

  const totalForType = (type: 'activo' | 'pasivo') => {
    const ids = new Set(categoryList.filter(c => c.type === type).map(c => c.id));
    return accountList
      .filter(a => ids.has(a.accountCategoryId))
      .reduce((sum, a) => sum + a.currentBalance, 0);
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
        <SectionHeader label="Activos" total={totalForType('activo')} />
        {activoCategories.map(cat => renderCategoryGroup(cat, 'text-green-600'))}

        <SectionHeader label="Pasivos" total={totalForType('pasivo')} />
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
