import type { HorseStatus } from '@/features/stables/types';
import type { TxKeyPath } from '@/lib/i18n';

import * as React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Text } from '@/components/ui';
import { tx } from '@/features/stables/lib/tx';

import { translate } from '@/lib/i18n';

/**
 * Status pill (S13-04 §3): In Training sage + forest, Pre-Training lilac
 * tint + plum, Rehab cream, Retired cream + muted. `hero` puts it on the
 * photo as a white pill with ink text. Same 30pt height as a `md` Button so
 * it pairs with the Follow button.
 */
const STATUS_STYLE: Record<HorseStatus, { box: string; text: string; label: TxKeyPath }> = {
  IN_TRAINING: { box: 'border border-forest/25 bg-sage/60', text: 'text-forest', label: 'stables.status.inTraining' },
  PRE_TRAINING: { box: 'border border-on-primary-container bg-primary-fixed/50', text: 'text-plum', label: 'stables.status.preTraining' },
  REHAB: { box: 'bg-secondary-container', text: 'text-ink', label: 'stables.status.rehab' },
  RETIRED: { box: 'bg-secondary-container', text: 'text-ink-muted', label: 'stables.status.retired' },
  SOLD: { box: 'bg-secondary-container', text: 'text-ink-muted', label: 'stables.status.sold' },
};

export function StatusPill({
  status,
  tone = 'card',
  className,
}: {
  status: HorseStatus;
  tone?: 'card' | 'hero';
  className?: string;
}) {
  const style = STATUS_STYLE[status];
  const hero = tone === 'hero';
  return (
    <View
      testID={`status-pill-${status}`}
      className={twMerge(
        'h-[30px] items-center justify-center rounded-md px-3',
        hero ? 'bg-white' : style.box,
        className,
      )}
    >
      <Text variant="body-sm" numberOfLines={1} className={twMerge('font-sans-semibold', hero ? 'text-ink' : style.text)}>
        {translate(style.label)}
      </Text>
    </View>
  );
}

/** "Declared · Sat Aug 18th": white, 1pt ice border (card) or plain white (hero). */
export function DeclaredPill({ date, className }: { date: string; className?: string }) {
  return (
    <View
      testID="declared-pill"
      className={twMerge('h-[30px] items-center justify-center rounded-md border border-ice bg-white px-3', className)}
    >
      <Text variant="body-sm" numberOfLines={1} className="font-sans-semibold text-ink">
        {tx('stables.declaredOn', { date })}
      </Text>
    </View>
  );
}
