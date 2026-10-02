import type { AuthUser } from '@/lib/auth/utils';
import { useForm } from '@tanstack/react-form';
import Env from 'env';
import * as React from 'react';

import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { client } from '@/lib/api/client';

const schema = z.object({
  email: z
    .string({ message: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string({ message: 'Password is required' })
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormProps = {
  onSuccess: (data: { token: string; user: AuthUser }) => Promise<void> | void;
};

function apiHost(): string {
  try {
    return new URL(Env.EXPO_PUBLIC_API_URL).host;
  }
  catch {
    return Env.EXPO_PUBLIC_API_URL;
  }
}

function describeLoginError(error: any): string {
  const status = error?.response?.status as number | undefined;
  if (status) {
    return (
      error.response?.data?.message
      ?? error.response?.data?.error
      ?? `Sign in failed (${status})`
    );
  }
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return `Can't reach ${apiHost()}. Check connection, or the API is down.`;
  }
  return error?.message ?? 'Sign in failed. Please check your credentials.';
}

function FormHeader() {
  const showHost = Env.EXPO_PUBLIC_APP_ENV !== 'production';
  return (
    <View className="mb-6 items-center justify-center">
      <Text
        testID="form-title"
        className="pb-2 text-center font-sans-bold text-4xl text-ink"
      >
        Rionna
      </Text>
      <Text className="text-center text-ink-muted">
        Sign in to your account
      </Text>
      {showHost && (
        <Text
          testID="api-host"
          className="mt-1 text-center text-xs text-ink-muted"
        >
          {apiHost()}
        </Text>
      )}
    </View>
  );
}

function FormFooter() {
  return (
    <View className="mt-8 items-center">
      {/* <Text className="text-center text-sm text-ink-muted">
        New members visit
        {' '}
        <Text className="font-sans-bold text-ink">
          rionna.com
        </Text>
        {' '}
        to join.
      </Text> */}
    </View>
  );
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const response = await client.post('/api/auth/sign-in/email', {
          email: value.email,
          password: value.password,
        });
        const { token, user } = response.data;
        await onSuccess({ token, user });
      }
      catch (e: any) {
        setError(describeLoginError(e));
      }
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <FormHeader />

        {error && (
          <View className="mb-4 rounded-lg bg-danger-50 p-3">
            <Text className="text-center text-sm text-ink">{error}</Text>
          </View>
        )}

        <form.Field
          name="email"
          children={field => (
            <Input
              testID="email-input"
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Field
          name="password"
          children={field => (
            <Input
              testID="password-input"
              label="Password"
              placeholder="***"
              secureTextEntry={true}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              testID="login-button"
              label="Sign In"
              onPress={form.handleSubmit}
              loading={isSubmitting}
            />
          )}
        />

        <FormFooter />
      </View>
    </KeyboardAvoidingView>
  );
}
