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
type CategoryOption = { label: string; value: string };

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

function useAccountForm(accountId: string | undefined, onDone: () => void) {
  const { accounts } = useDatabase();
  const isEdit = !!accountId;
  const existing = accountId ? accounts.findById(accountId) : undefined;
  return useForm({
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
        onDone();
      }
      catch {
        showErrorMessage('Error al guardar la cuenta');
      }
    },
  });
}

function FormFields({ form, categoryOptions, isEdit }: { form: ReturnType<typeof useAccountForm>; categoryOptions: CategoryOption[]; isEdit: boolean }) {
  return (
    <View className="flex-1 p-4">
      <form.Field name="name" children={field => <Input label="Nombre" value={field.state.value} onBlur={field.handleBlur} onChangeText={field.handleChange} error={getFieldError(field)} />} />
      <form.Field name="accountCategoryId" children={field => <Select label="Categoría" value={field.state.value} options={categoryOptions} onSelect={val => field.handleChange(String(val))} error={getFieldError(field)} />} />
      <form.Field name="initialBalance" children={field => <Input label="Saldo inicial" keyboardType="decimal-pad" value={field.state.value} onBlur={field.handleBlur} onChangeText={field.handleChange} error={getFieldError(field)} />} />
      <form.Field name="currentBalance" children={field => <Input label="Saldo actual" keyboardType="decimal-pad" value={field.state.value} onBlur={field.handleBlur} onChangeText={field.handleChange} error={getFieldError(field)} />} />
      <form.Field name="status" children={field => <Select label="Estado" value={field.state.value} options={STATUS_OPTIONS} onSelect={val => field.handleChange(val as 'active' | 'inactive')} error={getFieldError(field)} />} />
      <form.Subscribe selector={state => [state.isSubmitting]} children={([isSubmitting]) => <Button label={isEdit ? 'Actualizar cuenta' : 'Guardar cuenta'} loading={isSubmitting} onPress={form.handleSubmit} />} />
    </View>
  );
}

export function AccountFormScreen({ accountId }: Props) {
  const router = useRouter();
  const { accountCategories } = useDatabase();
  const isEdit = !!accountId;
  const categories: AccountCategory[] = accountCategories.findAll();
  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const form = useAccountForm(accountId, () => router.back());
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
      <FormFields form={form} categoryOptions={categoryOptions} isEdit={isEdit} />
    </>
  );
}
