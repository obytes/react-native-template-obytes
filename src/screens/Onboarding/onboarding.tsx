import React from 'react';

import { disableOnboarding } from '@/core/onboarding';
import { Button, Text, View } from '@/ui';
export const Onboarding = () => {
  return (
    <View className="flex h-full items-center  justify-center">
      <Text className="mb-2 text-lg">
        The right way to build your mobile app
      </Text>
      <Text className="my-3 text-5xl">Obytes Starter</Text>
      <Text className="my-1 text-left text-2xl">Beginner friendly</Text>
      <Text className="my-1 text-left text-2xl">Production-ready</Text>
      <Text className="my-1 text-left text-2xl">
        Minimal code and dependencies
      </Text>
      <View className="mt-6">
        <Button
          label="Let's Get Started "
          onPress={() => {
            disableOnboarding();
          }}
        />
      </View>
    </View>
  );
};
