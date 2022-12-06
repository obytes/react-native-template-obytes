import React from 'react';

import { setOnboarding } from '@/core/onboarding';
import { Button, Text, View } from '@/ui';
export const Onboarding = () => {
  return (
    <View className="flex justify-center items-center  h-full">
      <Text className="text-2xl">Hi There</Text>
      <Button label="Let's Get Started" onPress={() => setOnboarding()} />
    </View>
  );
};
