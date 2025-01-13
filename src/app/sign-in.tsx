import { useRouter } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useLogin } from '@/api/auth/use-login';
import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/core';
import { FocusAwareStatusBar } from '@/ui';

export default function Login() {
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
  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}
