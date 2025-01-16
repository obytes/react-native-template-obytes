import { useRouter } from 'expo-router';
import React from 'react';
import { showMessage } from 'react-native-flash-message';

import { useSignUp } from '@/api/auth/use-sign-up';
import type { SignUpFormProps } from '@/components/sign-up-form';
import { SignUpForm } from '@/components/sign-up-form';
import { FocusAwareStatusBar } from '@/ui';

export default function SignIn() {
  const router = useRouter();

  const { mutate: signUp, isPending } = useSignUp({
    onSuccess: () => {
      router.push('/');
    },
    onError: (error) => showMessage({ message: error.message, type: 'danger' }),
  });

  const onSubmit: SignUpFormProps['onSubmit'] = (data) => {
    signUp(data);
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SignUpForm onSubmit={onSubmit} isPending={isPending} />
    </>
  );
}
