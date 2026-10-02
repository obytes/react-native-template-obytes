import type { TrainerUpdate } from '@/features/pulse/types';

import { useRouter } from 'expo-router';

import { Pressable, Text, View } from '@/components/ui';
import { relativeTime } from '@/features/pulse/components/relative-time';
import { TileWrapper } from '@/features/pulse/components/tile-wrapper';

type TrainerUpdatesTileProps = {
  data: TrainerUpdate[] | undefined;
  isLoading: boolean;
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength)
    return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function UpdateRow({ update }: { update: TrainerUpdate }) {
  const router = useRouter();
  const excerpt = truncate(update.bodyText, 80);

  return (
    <Pressable
      onPress={() => router.push(`/stables/${update.horseId}`)}
      className="gap-2 px-6 py-4"
    >
      <Text className="font-mono text-[10px] tracking-widest text-primary uppercase">
        {update.horseName}
      </Text>
      <Text className="font-sans text-base text-ink">{excerpt}</Text>
      <Text className="font-mono text-xs tracking-wider text-ink-variant uppercase">
        {relativeTime(update.publishedAt)}
      </Text>
    </Pressable>
  );
}

export function TrainerUpdatesTile({
  data,
  isLoading,
}: TrainerUpdatesTileProps) {
  const hasUpdates = data && data.length > 0;

  return (
    <TileWrapper title="Trainer Updates" isLoading={isLoading}>
      {hasUpdates
        ? (
            <View className="pb-2">
              {data.map(update => (
                <UpdateRow key={update.id} update={update} />
              ))}
            </View>
          )
        : (
            <View className="px-6 pb-6">
              <Text className="font-sans text-base text-ink-variant">
                No trainer updates yet
              </Text>
            </View>
          )}
    </TileWrapper>
  );
}
