import type { AccountCategory } from '@/lib/database/repositories/_shared/types';

import { useForm } from '@tanstack/react-form';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import * as z from 'zod';

import { Button, Input, Select, showErrorMessage, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { useDatabase } from '@/lib/database/provider';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  accountCategoryId: z.string().min(1, 'Categoría requerida'),
  initialBalance: z.coerce.number(),
  currentBalance: z.coerce.number(),
  status: z.enum(['active', 'inactive']),
});

const STATUS_OPTIONS = [
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
];

type Props = { accountId?: string };

function useAccountFormSetup(accountId?: string) {
  const { accounts, accountCategories } = useDatabase();
  const isEdit = !!accountId;
  const existing = accountId ? accounts.findById(accountId) : undefined;
  const categories: AccountCategory[] = accountCategories.findAll();
  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  return { accounts, isEdit, existing, categories, categoryOptions };
}

function NoCategoriesView({ onPress }: { onPress: () => void }) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="mb-4 text-center text-neutral-500 dark:text-neutral-400">
        Primero crea una categoría de cuenta
      </Text>
      <Button label="Crear categoría" onPress={onPress} />
    </View>
  );
}

export function AccountFormScreen({ accountId }: Props) {
  const router = useRouter();
  const { accounts, isEdit, existing, categories, categoryOptions } = useAccountFormSetup(accountId);

  const form = useForm({
    defaultValues: {
      name: existing?.name ?? '',
      accountCategoryId: existing?.accountCategoryId ?? '',
      initialBalance: String(existing?.initialBalance ?? 0),
      currentBalance: String(existing?.currentBalance ?? 0),
      status: (existing?.status ?? 'active') as 'active' | 'inactive',
    },
    validators: { onChange: schema as any },
    onSubmit: ({ value }) => {
      try {
        const data = {
          name: value.name,
          accountCategoryId: value.accountCategoryId,
          initialBalance: Number(value.initialBalance),
          currentBalance: Number(value.currentBalance),
          status: value.status,
        };
        if (isEdit) {
          accounts.update(accountId!, data);
          showMessage({ message: 'Cuenta actualizada', type: 'success' });
        }
        else {
          accounts.create(data);
          showMessage({ message: 'Cuenta creada', type: 'success' });
        }
        router.back();
      }
      catch {
        showErrorMessage('Error al guardar la cuenta');
      }
    },
  });

  const title = isEdit ? 'Editar Cuenta' : 'Nueva Cuenta';

  if (categories.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <NoCategoriesView onPress={() => router.push('/cuentas/categorias/nueva')} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <View className="flex-1 p-4">
        <form.Field name="name" children={(f: any) => <Input label="Nombre" value={f.state.value} onBlur={f.handleBlur} onChangeText={f.handleChange} error={getFieldError(f)} />} />
        <form.Field name="accountCategoryId" children={(f: any) => <Select label="Categoría" value={f.state.value} options={categoryOptions} onSelect={(v: any) => f.handleChange(String(v))} error={getFieldError(f)} />} />
        <form.Field name="initialBalance" children={(f: any) => <Input label="Saldo inicial" keyboardType="decimal-pad" value={f.state.value} onBlur={f.handleBlur} onChangeText={f.handleChange} error={getFieldError(f)} />} />
        <form.Field name="currentBalance" children={(f: any) => <Input label="Saldo actual" keyboardType="decimal-pad" value={f.state.value} onBlur={f.handleBlur} onChangeText={f.handleChange} error={getFieldError(f)} />} />
        <form.Field name="status" children={(f: any) => <Select label="Estado" value={f.state.value} options={STATUS_OPTIONS} onSelect={(v: any) => f.handleChange(v as 'active' | 'inactive')} error={getFieldError(f)} />} />
        <form.Subscribe
          selector={(s: any) => [s.isSubmitting]}
          children={(s: any) => (
            <Button label={isEdit ? 'Actualizar cuenta' : 'Guardar cuenta'} loading={s[0]} onPress={form.handleSubmit} />
          )}
        />
      </View>
    </>
  );
}
