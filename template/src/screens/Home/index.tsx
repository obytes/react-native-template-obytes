import { Config } from '@config';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';

import { useAuth } from '@/core';
import { Button, showErrorMessage, Text, View } from '@/ui';

import { Card } from './card';

const articles = [
  {
    title: 'React Native',
    description:
      'React Native is an open-source mobile application framework developed by Facebook for building native apps.',
    image:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  },
  {
    title: 'React Native',
    description:
      'React Native is an open-source mobile application framework developed by Facebook for building native apps.',
    image: 'https://reactnative.dev/img/tiny_logo.png',
  },
];

export const Home = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={{ padding: 4 }}>
      <View className="flex-1 justify-center">
        {articles.map((article, index) => (
          <Card key={index} {...article} />
        ))}
        <Text variant="body" className="text-center text-gray-900">
          {t('taxonomy.charities')}
        </Text>
        <Text variant="body" className="text-center">
          This is An ENV Var : {Config.API_URL}
        </Text>
        <Button label="LogOut" onPress={signOut} />
        <Button
          variant="secondary"
          label="Show message"
          onPress={() => showErrorMessage()}
        />
      </View>
    </ScrollView>
  );
};
