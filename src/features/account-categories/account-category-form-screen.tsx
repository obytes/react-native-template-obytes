import { useForm } from '@tanstack/react-form';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import * as z from 'zod';

import { Button, Input, Select, showErrorMessage, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { useDatabase } from '@/lib/database/provider';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['activo', 'pasivo']),
});

const TYPE_OPTIONS = [
  { label: 'Activo', value: 'activo' },
  { label: 'Pasivo', value: 'pasivo' },
];

type Props = { categoryId?: string };

export function AccountCategoryFormScreen({ categoryId }: Props) {
  const { accountCategories } = useDatabase();
  const router = useRouter();
  const isEdit = !!categoryId;
  const existing = categoryId ? accountCategories.findById(categoryId) : undefined;

  const form = useForm({
    defaultValues: {
      name: existing?.name ?? '',
      type: (existing?.type ?? 'activo') as 'activo' | 'pasivo',
    },
    validators: { onChange: schema as any },
    onSubmit: ({ value }) => {
      try {
        if (isEdit) {
          accountCategories.update(categoryId!, value);
          showMessage({ message: 'Categoría actualizada', type: 'success' });
        }
        else {
          accountCategories.create(value);
          showMessage({ message: 'Categoría creada', type: 'success' });
        }
        router.back();
      }
      catch {
        showErrorMessage('Error al guardar la categoría');
      }
    },
  });

  return (
    <>
      <Stack.Screen
        options={{ title: isEdit ? 'Editar Categoría' : 'Nueva Categoría' }}
      />
      <View className="flex-1 p-4">
        <form.Field
          name="name"
          children={field => (
            <Input
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />
        <form.Field
          name="type"
          children={field => (
            <Select
              label="Tipo"
              value={field.state.value}
              options={TYPE_OPTIONS}
              onSelect={val => field.handleChange(val as 'activo' | 'pasivo')}
              error={getFieldError(field)}
            />
          )}
        />
        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              label={isEdit ? 'Actualizar categoría' : 'Guardar categoría'}
              loading={isSubmitting}
              onPress={form.handleSubmit}
            />
          )}
        />
      </View>
    </>
  );
}
