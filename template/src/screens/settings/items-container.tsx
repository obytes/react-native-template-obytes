import React from 'react';

import { Text, View } from '@/ui';

type Props = {
  children: React.ReactNode;
  title: string;
};

export const ItemsContainer = ({ children, title }: Props) => {
  return (
    <>
      <Text variant="lg" className="pt-4 pb-2">
        {title}
      </Text>
      <View className="rounded-md border-[1px] border-neutral-200">
        {children}
      </View>
    </>
  );
};
