import React from 'react';
import {Button, Screen, showErrorMessage, Text, View} from 'ui';
import {API_URL} from '@env';
import {translate, useAuth} from 'core';
import {useTasks} from 'api';
import {ActivityIndicator} from 'react-native';

export const Home = () => {
  const {signOut} = useAuth();
  const {data, isLoading} = useTasks();
  return (
    <Screen>
      <View flex={1} justifyContent="center">
        <Text variant="header" textAlign="center">
          {translate('name')}
        </Text>
        <Text variant="body" textAlign="center">
          This is An ENV Var : {API_URL}
        </Text>
        {isLoading && <ActivityIndicator color="#000" />}

        <Text variant="body" textAlign="center">
          Data from Api : {JSON.stringify(data)}
        </Text>
        <Button label="LogOut" onPress={signOut} />
        <Button
          variant="secondary"
          label="Show message"
          onPress={() => showErrorMessage()}
        />
      </View>
    </Screen>
  );
};
