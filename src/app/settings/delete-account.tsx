import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  FocusAwareStatusBar,
  Input,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { signOut } from '@/features/auth/use-auth-store';
import { client } from '@/lib/api/client';
import { translate } from '@/lib/i18n';

const schema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmText: z
    .string()
    .refine(v => v === 'DELETE', { message: 'Type DELETE to confirm' }),
});

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: { password: '', confirmText: '' },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await client.post('/api/auth/delete-user', {
          password: value.password,
        });
        signOut();
        router.replace('/login');
      }
      catch (e: any) {
        const message
          = e.response?.data?.message
            ?? e.response?.data?.error
            ?? 'Account deletion failed.';
        setError(message);
      }
    },
  });

  return (
    <>
      <FocusAwareStatusBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView className="flex-1 bg-background">
          <View className="flex-1 px-4 pt-6 pb-10">
            <Text className="font-display text-3xl text-ink">
              {translate('settings.deleteAccount.title')}
            </Text>

            <View className="mt-4 rounded-lg bg-danger-50 p-4">
              <Text className="text-sm text-ink">
                {translate('settings.deleteAccount.warning')}
              </Text>
            </View>

            {error && (
              <View className="mt-4 rounded-lg bg-danger-50 p-3">
                <Text className="text-center text-sm text-ink">{error}</Text>
              </View>
            )}

            <View className="mt-4">
              <form.Field
                name="password"
                children={field => (
                  <Input
                    label={translate('settings.deleteAccount.password')}
                    secureTextEntry
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    error={getFieldError(field)}
                  />
                )}
              />
              <form.Field
                name="confirmText"
                children={field => (
                  <Input
                    label={translate('settings.deleteAccount.confirmPrompt')}
                    autoCapitalize="characters"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    error={getFieldError(field)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => [state.isSubmitting, state.canSubmit]}
                children={([isSubmitting, canSubmit]) => (
                  <Button
                    variant="destructive"
                    label={translate('settings.deleteAccount.submit')}
                    onPress={form.handleSubmit}
                    loading={isSubmitting}
                    disabled={!canSubmit || isSubmitting}
                  />
                )}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
