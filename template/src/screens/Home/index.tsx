import React from 'react';
import {Button, Screen, Text, Input, View} from 'ui';
import {API} from '@env';
import {translate} from 'core';

export const Home = () => {
  return (
    <Screen>
      <View flex={1} justifyContent="center">
        <Text variant="header" textAlign="center">
          {translate('name')}
        </Text>
        <Text variant="header" textAlign="center">
          This is An ENV Var : {API}
        </Text>
      </View>
      <View flex={1}>
        <Button
          label="This is a button "
          onPress={() => {}}
          variant="primary"
        />
        <Input name="firstName" label="First Name" placeholder="Your Name" />
        <Input
          name="lastName"
          label="Last Name"
          placeholder="Your Last  Name"
        />
      </View>
    </Screen>
  );
};
