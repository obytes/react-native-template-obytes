import React from 'react';

import { useIsFirstTime } from '@/core/hooks';
import { Button, Image, SafeAreaView, Text, View } from '@/ui';
export const Onboarding = () => {
  // TODO: disable this rule for vars with underscore
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [_, setIsFirstTime] = useIsFirstTime();
  return (
    <View className="flex h-full items-center justify-center bg-white">
      <Image
        style={
          //eslint-disble-next-line eslint(react-native/no-inline-styles)
          { flex: 1, width: '100%' }
        }
        source={require('./cover.png')}
      />

      <View className="justify-end ">
        <Text className="my-3 text-center text-5xl font-bold ">
          Obytes Starter
        </Text>
        <Text className="mb-2 text-center text-lg text-gray-600">
          The right way to build your mobile app
        </Text>

        <Text className="my-1 pt-6 text-left text-lg">
          🚀 Production-ready{' '}
        </Text>
        <Text className="my-1 text-left text-lg">
          🥷 Developer experience + Productivity
        </Text>
        <Text className="my-1 text-left text-lg">
          🧩 Minimal code and dependencies
        </Text>
        <Text className="my-1 text-left text-lg">
          💪 well maintained third-party libraries
        </Text>
      </View>
      <SafeAreaView className="mt-6">
        <Button
          label="Let's Get Started "
          onPress={() => {
            setIsFirstTime(false);
          }}
        />
      </SafeAreaView>
    </View>
  );
};
