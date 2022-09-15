import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { useAuth } from '@/core';
import { Button, ControlledInput, View } from '@/ui';

type FormData = {
  email: string;
  password: string;
};

const schema = yup.object().shape({
  email: yup.string().required().email(),
  password: yup.string().required().min(6),
});

export const Login = () => {
  const { signIn } = useAuth();

  const { handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    signIn({ access: 'access-token', refresh: 'refresh-token' });
  };
  return (
    <View className="flex-1 justify-center p-4">
      <ControlledInput control={control} name="email" label="Email" />
      <ControlledInput
        control={control}
        name="password"
        label="Password"
        placeholder="***"
        secureTextEntry={true}
      />
      <Button
        label="Login"
        onPress={handleSubmit(onSubmit)}
        variant="primary"
      />
      <Button
        label="Login"
        onPress={handleSubmit(onSubmit)}
        variant="secondary"
      />
    </View>
  );
};
