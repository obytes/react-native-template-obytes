import React from 'react';

import { useIsFirstTime } from '@/core/hooks';
import { Button, Image, SafeAreaView, Text, View } from '@/ui';
export const Onboarding = () => {
  // TODO: disable this rule for vars with underscore
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [_, setIsFirstTime] = useIsFirstTime();
  return (
    <View className="flex h-full items-center  justify-center bg-white">
      <Image className="w-full flex-1" source={require('./cover.png')} />

      <View className="justify-end ">
        <Text className="my-3 text-5xl font-bold text-center">
          Obytes Starter
        </Text>
        <Text className="mb-2 text-lg text-center text-gray-600">
          The right way to build your mobile app
        </Text>

        <Text className="my-1 text-left text-lg pt-6">
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
