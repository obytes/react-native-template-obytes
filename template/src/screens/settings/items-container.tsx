import React from 'react';

import type { TxKeyPath } from '@/core';
import { Text, View } from '@/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export const ItemsContainer = ({ children, title }: Props) => {
  return (
    <>
      {title && <Text variant="lg" className="pt-4 pb-2" tx={title} />}
      <View className="rounded-md border-[1px] border-neutral-200">
        {children}
      </View>
    </>
  );
};
