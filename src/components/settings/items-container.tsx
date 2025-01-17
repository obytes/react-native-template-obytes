import React from 'react';

import type { TxKeyPath } from '@/core';
import { Text, View } from '@/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export const ItemsContainer = ({ children, title }: Props) => (
  <View className="gap-2">
    {title && <Text className="text-lg" tx={title} />}
    {
      <View className=" rounded-md border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800">
        {children}
      </View>
    }
  </View>
);
