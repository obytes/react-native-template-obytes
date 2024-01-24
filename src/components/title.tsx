import * as React from 'react';

import { Text, View } from '@/ui';

type Props = {
  text: string;
};
export const Title = ({ text }: Props) => {
  return (
    <View className="flex-row items-center justify-center pb-2 pt-4">
      <Text variant="lg" className="pr-2">
        {text}
      </Text>
      <View className="h-[2px] flex-1 bg-neutral-200" />
    </View>
  );
};
