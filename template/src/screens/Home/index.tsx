import React from 'react';
import {Button, Screen, Text, Input, View} from 'ui';
import {API} from '@env';
import {translate} from 'core';

export const Home = () => {
  return (
    <Screen>
      <View flex={1} justifyContent="center">
        <Text variant="header" textAlign="center">
          {translate('hello')}
        </Text>
        <Text variant="body" textAlign="center">
          Bunny App is Here {API}
        </Text>
      </View>
      <View flex={1}>
        <Button
          label="Delete This Option"
          onPress={() => {}}
          variant="primary"
        />
        <Input
          name="advice"
          label="Preparation Advice"
          placeholder="Enter preparation advice for dish"
        />
        <Input
          name="advice"
          label="Preparation Advice"
          placeholder="Enter preparation advice for dish"
        />
        <Input
          name="advice"
          label="Preparation Advice"
          placeholder="Enter preparation advice for dish"
        />
      </View>
    </Screen>
  );
};
