import React from 'react';

import { useAuth } from '@/core';

import type { FormType } from './login-form';
import { LoginForm } from './login-form';

export const Login = () => {
  const signIn = useAuth.use.signIn();

  const onSubmit = (data: FormType) => {
    console.log(data);
    signIn({ access: 'access-token', refresh: 'refresh-token' });
  };
  return <LoginForm onSubmit={onSubmit} />;
};
