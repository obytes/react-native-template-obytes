import * as React from 'react';

import { Text, View } from '@/ui';

type Props = {
  text: string;
};
export const Title = ({ text }: Props) => {
  return (
    <View className="flex-row items-center justify-center pt-4 pb-2">
      <Text variant="lg" className="pr-2">
        {text}
      </Text>
      <View className="h-[2px] flex-1 bg-neutral-200" />
    </View>
  );
};
