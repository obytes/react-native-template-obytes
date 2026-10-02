import type { Entry } from '@/features/stables/types';
import { Text, View } from '@/components/ui';

type NextEntryCardProps = {
  entry: Entry;
};

function formatPostTime(postTime: string): string {
  const date = new Date(postTime);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function NextEntryCard({ entry }: NextEntryCardProps) {
  const { race } = entry;
  const courseName = race.meeting.course.name;
  const meetingDate = formatDate(race.meeting.date);
  const postTime = formatPostTime(race.postTime);

  return (
    <View className="overflow-hidden rounded-2xl bg-muted p-4">
      <Text className="mb-1 font-mono text-[10px] tracking-widest text-primary uppercase">
        Next Entry
      </Text>

      {race.name
        ? (
            <Text className="mb-2 font-display text-lg text-ink">
              {race.name}
            </Text>
          )
        : null}

      <View className="mb-3 flex-row items-center gap-2">
        <Text className="font-sans-semibold text-sm text-ink">
          {courseName}
        </Text>
        <Text className="text-sm text-ink-muted">
          {meetingDate}
          {' '}
          at
          {postTime}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-2">
        {entry.draw != null
          ? (
              <DetailItem label="Draw" value={String(entry.draw)} />
            )
          : null}

        {entry.weightLbs != null
          ? (
              <DetailItem label="Weight" value={`${entry.weightLbs} lbs`} />
            )
          : null}

        {entry.jockey
          ? (
              <DetailItem label="Jockey" value={entry.jockey.name} />
            )
          : null}

        {race.goingDescription
          ? (
              <DetailItem label="Going" value={race.goingDescription} />
            )
          : null}
      </View>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xs text-ink-muted">{label}</Text>
      <Text className="font-sans-medium text-sm text-ink">{value}</Text>
    </View>
  );
}
