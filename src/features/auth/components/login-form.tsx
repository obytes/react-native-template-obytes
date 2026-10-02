import type { AuthUser } from '@/lib/auth/utils';
import { useForm } from '@tanstack/react-form';
import Env from 'env';
import * as React from 'react';
import { Keyboard, ScrollView, useWindowDimensions } from 'react-native';

import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Submark } from '@/components/brand/logo';
import { Button, colors, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { LoginMedia } from '@/features/arrival/login-media';
import { client } from '@/lib/api/client';
import { openExternalLink } from '@/lib/open-external-link';

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

const POSTER = require('../../../../assets/login-poster.jpg');

const SHORT_SCREEN_HEIGHT = 700;
const MARKETING_URL = 'https://rionna.com';

/** Forgot-password lives on the web app, at the API/auth origin. */
export function forgotPasswordUrl(apiUrl: string = Env.EXPO_PUBLIC_API_URL): string {
  try {
    return `${new URL(apiUrl).origin}/forgot-password`;
  }
  catch {
    return `${apiUrl.replace(/\/+$/, '')}/forgot-password`;
  }
}

/** True while the software keyboard is up. */
function useKeyboardVisible(): boolean {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const subs = [
      Keyboard.addListener('keyboardDidShow', () => setVisible(true)),
      Keyboard.addListener('keyboardDidHide', () => setVisible(false)),
    ];
    return () => subs.forEach(sub => sub.remove());
  }, []);
  return visible;
}

function FormHeader() {
  const showHost = Env.EXPO_PUBLIC_APP_ENV !== 'production';
  return (
    <View className="items-center">
      <Submark width={52} color={colors.secondaryContainer} />
      <Text
        testID="form-title"
        variant="display-xl"
        className="mt-6 text-center text-secondary-container"
      >
        <Text variant="display-xl" className="text-on-primary-container">Not </Text>
        just for the few.
      </Text>
      <Text
        variant="body"
        className="mt-6 text-center font-sans-medium text-on-primary-container"
      >
        Welcome to Rionna, a new way into racing.
      </Text>
      {showHost && (
        <Text
          testID="api-host"
          variant="body-sm"
          className="mt-1 text-center text-on-primary-container opacity-60"
        >
          {apiHost()}
        </Text>
      )}
    </View>
  );
}

function FormFooter() {
  return (
    <View className="mt-4 items-center gap-2">
      <Text
        testID="forgot-password-link"
        accessibilityRole="link"
        variant="body-sm"
        className="font-sans-medium text-on-primary-container"
        onPress={() => openExternalLink(forgotPasswordUrl())}
      >
        Forgot password?
      </Text>
      <Text variant="body-sm" className="font-sans-medium text-white">
        {'Don’t have an account? '}
        <Text
          testID="signup-link"
          accessibilityRole="link"
          variant="body-sm"
          className="font-sans-medium text-on-primary-container"
          onPress={() => openExternalLink(MARKETING_URL)}
        >
          Rionna.com
        </Text>
      </Text>
    </View>
  );
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const keyboardVisible = useKeyboardVisible();
  const { height } = useWindowDimensions();
  const collapseMedia = keyboardVisible && height < SHORT_SCREEN_HEIGHT;

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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow items-center justify-center gap-8 px-8 py-[60px]"
      >
        <FormHeader />

        {!collapseMedia && <LoginMedia poster={POSTER} />}

        <View className="w-full">
          {error && (
            <Text
              testID="login-error"
              accessibilityRole="alert"
              variant="body-sm"
              className="mb-2 text-center font-sans-medium text-on-primary-container"
            >
              {error}
            </Text>
          )}

          <form.Field
            name="email"
            children={field => (
              <Input
                testID="email-input"
                tone="dark"
                accessibilityLabel="Email"
                placeholder="Email"
                autoCapitalize="none"
                autoComplete="email"
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
                tone="dark"
                accessibilityLabel="Password"
                placeholder="Password"
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
                variant="on-dark"
                onPress={form.handleSubmit}
                loading={isSubmitting}
              />
            )}
          />

          <FormFooter />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
