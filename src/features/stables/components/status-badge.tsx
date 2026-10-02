import type { HorseStatus } from '@/features/stables/types';
import { Text, View } from '@/components/ui';

// Digital Estate design system: chips sit on surface-container-high with
// primary/ink text. Status meaning is carried by typography + label only,
// not brand palette colour (§2 text rule).
const STATUS_CONFIG: Record<
  HorseStatus,
  { label: string; bg: string; text: string }
> = {
  IN_TRAINING: {
    label: 'In Training',
    bg: 'bg-primary',
    text: 'text-on-primary',
  },
  REHAB: {
    label: 'Rehab',
    bg: 'bg-muted',
    text: 'text-primary',
  },
  RETIRED: {
    label: 'Retired',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
  PRE_TRAINING: {
    label: 'Pre-Training',
    bg: 'bg-muted',
    text: 'text-primary',
  },
  SOLD: {
    label: 'Sold',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
};

type StatusBadgeProps = {
  status: HorseStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View className={`rounded-full px-2.5 py-0.5 ${config.bg}`}>
      <Text className={`font-sans-medium text-xs ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
