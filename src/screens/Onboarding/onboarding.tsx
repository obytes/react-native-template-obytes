import React from 'react';

import { setOnboarding } from '@/core/onboarding';
import { Button, Text, View } from '@/ui';
export const Onboarding = () => {
  return (
    <View className="flex justify-center items-center  h-full">
      <Text className="text-lg mb-2">
        The right way to build your mobile app
      </Text>
      <Text className="text-5xl my-3">Obytes Starter</Text>
      <Text className="text-2xl text-left my-1">Beginner friendly</Text>
      <Text className="text-2xl text-left my-1">Production-ready</Text>
      <Text className="text-2xl text-left my-1">
        Minimal code and dependencies
      </Text>
      <View className="mt-6">
        <Button label="Let's Get Started " onPress={() => setOnboarding()} />
      </View>
    </View>
  );
};
