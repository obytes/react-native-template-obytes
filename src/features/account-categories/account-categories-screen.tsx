import type { AccountCategory } from '@/lib/database/repositories/_shared/types';

import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { useCallback, useState } from 'react';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { useDatabase } from '@/lib/database/provider';

export function AccountCategoriesScreen() {
  const { accountCategories } = useDatabase();
  const router = useRouter();
  const [categories, setCategories] = useState<AccountCategory[]>([]);

  useFocusEffect(
    useCallback(() => {
      setCategories(accountCategories.findAll());
    }, [accountCategories]),
  );

  const activo = categories.filter(c => c.type === 'activo');
  const pasivo = categories.filter(c => c.type === 'pasivo');

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Categorías',
          headerRight: () => (
            <Pressable onPress={() => router.push('/cuentas/categorias/nueva')}>
              <Text className="px-3 text-lg text-primary-300">+</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1">
        <View className="border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
          <Text className="text-xs font-bold tracking-widest text-neutral-700 uppercase dark:text-neutral-300">
            Activos
          </Text>
        </View>
        {activo.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => router.push(`/cuentas/categorias/${cat.id}`)}
            className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Text className="font-medium">{cat.name}</Text>
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-blue-100 px-2 py-0.5 dark:bg-blue-900">
                <Text className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  ACTIVO
                </Text>
              </View>
              <Text className="text-neutral-400">›</Text>
            </View>
          </Pressable>
        ))}

        <View className="border-t-2 border-b border-neutral-200 border-t-neutral-300 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:border-t-neutral-600 dark:bg-neutral-800">
          <Text className="text-xs font-bold tracking-widest text-neutral-700 uppercase dark:text-neutral-300">
            Pasivos
          </Text>
        </View>
        {pasivo.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => router.push(`/cuentas/categorias/${cat.id}`)}
            className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Text className="font-medium">{cat.name}</Text>
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-pink-100 px-2 py-0.5 dark:bg-pink-900">
                <Text className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                  PASIVO
                </Text>
              </View>
              <Text className="text-neutral-400">›</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
