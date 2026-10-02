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
import { client } from '@/lib/api/client';
import { translate } from '@/lib/i18n';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New passwords don\'t match',
    path: ['confirmPassword'],
  });

function PasswordField({
  form,
  name,
  labelKey,
}: {
  form: any;
  name: 'currentPassword' | 'newPassword' | 'confirmPassword';
  labelKey: Parameters<typeof translate>[0];
}) {
  return (
    <form.Field
      name={name}
      children={(field: any) => (
        <Input
          label={translate(labelKey)}
          secureTextEntry
          value={field.state.value}
          onBlur={field.handleBlur}
          onChangeText={field.handleChange}
          error={getFieldError(field)}
        />
      )}
    />
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const form = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await client.post('/api/auth/change-password', {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: false,
        });
        setSuccess(true);
        setTimeout(() => router.back(), 800);
      }
      catch (e: any) {
        const message
          = e.response?.data?.message
            ?? e.response?.data?.error
            ?? 'Password change failed.';
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
              {translate('settings.changePassword.title')}
            </Text>

            {error && (
              <View className="mt-4 rounded-lg bg-danger-50 p-3">
                <Text className="text-center text-sm text-ink">{error}</Text>
              </View>
            )}

            {success && (
              <View className="mt-4 rounded-lg bg-success-50 p-3">
                <Text className="text-center text-sm text-ink">
                  {translate('settings.changePassword.success')}
                </Text>
              </View>
            )}

            <View className="mt-4">
              <PasswordField form={form} name="currentPassword" labelKey="settings.changePassword.current" />
              <PasswordField form={form} name="newPassword" labelKey="settings.changePassword.new" />
              <PasswordField form={form} name="confirmPassword" labelKey="settings.changePassword.confirm" />
              <form.Subscribe
                selector={state => [state.isSubmitting, state.canSubmit]}
                children={([isSubmitting, canSubmit]) => (
                  <Button
                    label={translate('settings.changePassword.submit')}
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
