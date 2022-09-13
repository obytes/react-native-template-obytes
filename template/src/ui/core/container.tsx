import type { ReactNode } from 'react';
import * as React from 'react';

import { View } from './view';

type Props = {
  children: ReactNode;
};

// global container with prefix padding
export const Container = ({ children }: Props) => {
  return <View className="flex-1 p-8">{children}</View>;
};
