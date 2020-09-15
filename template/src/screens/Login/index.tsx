import React from 'react';
import {Button, Screen, Input} from 'ui';
import {useAuth} from 'core';

export const Login = () => {
  const {signIn} = useAuth();
  return (
    <Screen>
      <Input name="firstName" label="First Name" placeholder="Your Name" />
      <Input name="lastName" label="Last Name" placeholder="Your Last  Name" />
      <Button
        label="Login"
        onPress={() => {
          signIn('my-token-secret');
        }}
        variant="primary"
      />
    </Screen>
  );
};
