import { ProgressBar, Text, View } from '@/components/ui';

type PollResultBarProps = {
  label: string;
  percent: number;
  mine: boolean;
  optionId: string;
};

export function PollResultBar({ label, percent, mine, optionId }: PollResultBarProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center gap-2">
          <Text variant="body" className={mine ? 'font-sans-semibold' : 'text-ink-variant'}>{label}</Text>
          {mine ? <Text testID={`poll-my-choice-${optionId}`} variant="body" className="text-primary">✓</Text> : null}
        </View>
        <Text variant="label">{`${percent}%`}</Text>
      </View>
      <ProgressBar testID={`poll-bar-${optionId}`} value={percent} tone="light" height={8} />
    </View>
  );
}
