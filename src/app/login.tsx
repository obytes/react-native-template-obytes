import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import { useLogin } from '@/api/auth/use-login';
import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/core';
import { Button, FocusAwareStatusBar } from '@/ui';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const signIn = useAuth.use.signIn();
  const { mutate: login } = useLogin({
    onSuccess: (data) => {
      signIn({ access: data.accessToken, refresh: data.refreshToken });
      router.push('/');
    },
    onError: (error) => showMessage({ message: error.message, type: 'danger' }),
  });

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    login(data);
  };

  const navigateToForgotPasswordScreen = () => {
    router.push('/forgot-password');
  };
  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
      <Button
        testID="login-button"
        variant="link"
        label={t('auth.sign-in.forgotPasswordButton')}
        onPress={navigateToForgotPasswordScreen}
      />
    </>
  );
}
