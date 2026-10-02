import * as React from 'react';

import { Card, MonoLabel } from '@/components/ui';

type SettingsCardProps = {
  /** Mono label at the top of the card. */
  title?: string;
  children: React.ReactNode;
  className?: string;
  testID?: string;
};

/** White V2 card holding ListRows; the last row should pass `divider={false}`. */
export function SettingsCard({ title, children, className, testID }: SettingsCardProps) {
  return (
    <Card testID={testID} className={className}>
      {title ? <MonoLabel className="mb-1">{title}</MonoLabel> : null}
      {children}
    </Card>
  );
}
