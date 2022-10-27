import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useAuth } from '@/core';
import { Button, ControlledInput, View } from '@/ui';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormType = z.infer<typeof schema>;

export const Login = () => {
  const { signIn } = useAuth();

  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormType) => {
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
