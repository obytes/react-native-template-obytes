import React from 'react';
import {Button, Screen, Text, View} from 'ui';
import {API} from '@env';
import {translate, useAuth} from 'core';

export const Home = () => {
  const {signOut} = useAuth();
  return (
    <Screen>
      <View flex={1} justifyContent="center">
        <Text variant="header" textAlign="center">
          {translate('name')}
        </Text>
        <Text variant="body" textAlign="center">
          This is An ENV Var : {API}
        </Text>
        <Button label="LogOut" onPress={signOut} />
      </View>
    </Screen>
  );
};
