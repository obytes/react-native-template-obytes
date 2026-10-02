import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

/** Dev gallery section: a mono heading over its specimens. Dev-only, untranslated. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text variant="label" className="border-b border-outline-variant pb-1 text-ink">{title}</Text>
      {children}
    </View>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <Text variant="body-sm" className="text-ink-muted">{children}</Text>;
}
