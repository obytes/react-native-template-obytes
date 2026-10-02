import type { Entry } from '@/features/stables/types';
import { Pressable, Text, View } from '@/components/ui';
import { openExternalLink } from '@/lib/open-external-link';

type ResultRowProps = {
  entry: Entry;
};

function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const remainder = n % 100;
  const suffix
    = suffixes[(remainder - 20) % 10] ?? suffixes[remainder] ?? suffixes[0];
  return `${n}${suffix}`;
}

function getPositionColor(position: number | null): string {
  switch (position) {
    case 1:
      return 'text-yellow-600';
    case 2:
      return 'text-ink-muted';
    case 3:
      return 'text-amber-700';
    default:
      return 'text-ink-variant';
  }
}

function getPositionBg(position: number | null): string {
  switch (position) {
    case 1:
      return 'bg-yellow-50';
    case 2:
      return 'bg-surface';
    case 3:
      return 'bg-amber-50';
    default:
      return 'bg-surface';
  }
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

/** Furlongs -> "Xm Yf" shorthand, e.g. 22 -> "2m6f", 7 -> "7f". */
function formatDistance(furlongs: number): string {
  const miles = Math.floor(furlongs / 8);
  const remainder = furlongs % 8;
  if (miles === 0)
    return `${remainder}f`;
  if (remainder === 0)
    return `${miles}m`;
  return `${miles}m${remainder}f`;
}

export function ResultRow({ entry }: ResultRowProps) {
  const { race } = entry;
  const position = entry.finishingPosition;
  const courseName = race.meeting.course.name;
  const date = formatShortDate(race.meeting.date);

  const detailParts = [
    entry.jockey?.name,
    race.distanceFurlongs != null ? formatDistance(race.distanceFurlongs) : null,
    race.goingDescription,
  ].filter((part): part is string => Boolean(part));

  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View
        className={`size-10 items-center justify-center rounded-full ${getPositionBg(position)}`}
      >
        {position != null
          ? (
              <Text
                className={`text-sm font-bold ${getPositionColor(position)}`}
              >
                {getOrdinal(position)}
              </Text>
            )
          : (
              <Text className="text-sm font-bold text-ink-muted">--</Text>
            )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-ink">
            {courseName}
          </Text>
          <Text className="text-xs text-ink-muted">{date}</Text>
        </View>

        {race.name
          ? (
              <Text
                className="mt-0.5 text-xs text-ink-variant"
                numberOfLines={1}
              >
                {race.name}
              </Text>
            )
          : null}

        {detailParts.length > 0
          ? (
              <Text
                className="mt-0.5 text-xs text-ink-muted"
                numberOfLines={1}
              >
                {detailParts.join(' · ')}
              </Text>
            )
          : null}

        {entry.timeformComment
          ? (
              <Text
                className="mt-0.5 text-xs text-ink-muted"
                numberOfLines={1}
              >
                {entry.timeformComment}
              </Text>
            )
          : null}

        {entry.replayUrl
          ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Watch replay"
                hitSlop={8}
                onPress={() => openExternalLink(entry.replayUrl as string)}
                className="mt-1.5 self-start"
              >
                <Text className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
                  Watch Replay
                </Text>
              </Pressable>
            )
          : null}
      </View>
    </View>
  );
}
