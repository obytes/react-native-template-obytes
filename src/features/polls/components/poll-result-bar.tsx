import { Text, View } from '@/components/ui';

type PollResultBarProps = {
  label: string;
  percent: number;
  mine: boolean;
  optionId: string;
};

export function PollResultBar({ label, percent, mine, optionId }: PollResultBarProps) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className={`font-sans text-sm ${mine ? 'font-sans-semibold text-ink' : 'text-ink-variant'}`}>{label}</Text>
          {mine ? <Text testID={`poll-my-choice-${optionId}`} className="font-sans text-sm text-primary">✓</Text> : null}
        </View>
        <Text className="font-mono text-xs text-ink-variant">{`${percent}%`}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-container">
        <View
          testID={`poll-bar-${optionId}`}
          className={`h-2 rounded-full ${mine ? 'bg-primary' : 'bg-outline-variant'}`}
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
}
