import { Stack, useRouter } from 'expo-router';
import * as React from 'react';

import { ScreenHeader } from '@/components/ui';

type PageHeaderProps = {
  kicker: string;
  right?: React.ReactNode;
  testID?: string;
};

/**
 * Cream-page mono header with back (S13-08). Hides the native stack header
 * from inside the screen so `_layout.tsx` stays untouched.
 */
export function PageHeader({ kicker, right, testID = 'page-header' }: PageHeaderProps) {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader kicker={kicker} right={right} onBack={() => router.back()} testID={testID} />
    </>
  );
}
