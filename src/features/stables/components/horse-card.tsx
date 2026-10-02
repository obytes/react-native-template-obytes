import type { Horse } from '@/features/stables/types';
import { Image, Pressable, Text, View } from '@/components/ui';
import { FollowToggle } from '@/features/stables/components/follow-toggle';
import { StatusBadge } from '@/features/stables/components/status-badge';

type HorseCardProps = {
  horse: Horse;
  onPress: () => void;
  /** Omit to render the card read-only, without the follow heart. */
  onToggleFollow?: (horseId: string, following: boolean) => void;
  followPending?: boolean;
};

export function HorseCard({ horse, onPress, onToggleFollow, followPending = false }: HorseCardProps) {
  const photoUrl = horse.photos[0]?.url;

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl bg-card"
    >
      <View className="relative">
        {photoUrl
          ? (
              <Image
                source={{ uri: `${photoUrl}?width=400&quality=80` }}
                className="aspect-3/2 w-full"
                contentFit="cover"
              />
            )
          : (
              <View className="aspect-3/2 w-full items-center justify-center bg-muted">
                <Text className="text-sm text-muted-foreground">No photo</Text>
              </View>
            )}

        {onToggleFollow
          ? (
              <FollowToggle
                variant="overlay"
                isFollowing={horse.isFollowing}
                pending={followPending}
                onToggle={following => onToggleFollow(horse.id, following)}
                confirmBeforeUnfollow={horse.inviteOnly ? { horseName: horse.name } : undefined}
              />
            )
          : null}
      </View>

      <View className="gap-2 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-2xl text-foreground">
            {horse.name}
          </Text>
          <View className="flex-row items-center gap-2">
            {horse.inviteOnly
              ? (
                  <View className="rounded-full bg-muted px-3.5 py-2">
                    <Text className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                      Private
                    </Text>
                  </View>
                )
              : null}
            <StatusBadge status={horse.status} />
          </View>
        </View>

        {horse.trainer
          ? (
              <Text className="text-sm text-muted-foreground">
                Trainer:
                {' '}
                {horse.trainer.name}
              </Text>
            )
          : null}

        {horse.nextEntryId
          ? (
              <View className="mt-1 rounded-lg bg-muted px-3 py-2">
                <Text className="font-mono text-[10px] tracking-widest text-primary uppercase">
                  Entry upcoming
                </Text>
              </View>
            )
          : null}
      </View>
    </Pressable>
  );
}
