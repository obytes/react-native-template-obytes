import type { Horse } from '@/features/stables/types';

import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, getInitials, Image, Tag, Text } from '@/components/ui';
import { FollowToggle } from '@/features/stables/components/follow-toggle';
import { DeclaredPill, StatusPill } from '@/features/stables/components/status-pill';
import {
  formatDeclaredDate,
  getDeclaredEntry,
  getProfileLine,
  getTrainerLine,
} from '@/features/stables/lib/horse-facts';
import { translate } from '@/lib/i18n';

type HorseCardProps = {
  horse: Horse;
  onPress: () => void;
  /** Omit to render the card read-only, without the Follow button. */
  onToggleFollow?: (horseId: string, following: boolean) => void;
  followPending?: boolean;
};

/**
 * Stables list card (S13-04 §3, Figma frame 6): white row card, 86×146
 * photo on the left, name / ⏳profile line / trainer on the right, then the
 * status (or Declared) pill and the Follow button along the bottom.
 */
export function HorseCard({ horse, onPress, onToggleFollow, followPending = false }: HorseCardProps) {
  const photoUrl = horse.photos[0]?.url;
  const profileLine = getProfileLine(horse);
  const trainerLine = getTrainerLine(horse);
  const declared = getDeclaredEntry(horse.entries);

  const follow = onToggleFollow
    ? (
        <FollowToggle
          testID={`horse-card-follow-${horse.id}`}
          className="flex-1"
          isFollowing={horse.isFollowing}
          pending={followPending}
          onToggle={following => onToggleFollow(horse.id, following)}
          confirmBeforeUnfollow={horse.inviteOnly ? { horseName: horse.name } : undefined}
        />
      )
    : null;

  return (
    <Pressable
      testID={`horse-card-${horse.id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={horse.name}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
    >
      <Card className="flex-row gap-4 border border-outline-variant">
        <View className="min-h-[146px] w-[86px] overflow-hidden rounded-lg">
          <Image
            testID="horse-card-photo"
            source={photoUrl ? { uri: `${photoUrl}?width=400&quality=80` } : null}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            fallback={{ colourway: 'navy', initials: getInitials(horse.name) }}
            accessibilityIgnoresInvertColors
          />
        </View>

        <View className="flex-1 justify-between gap-4">
          <View className="gap-2">
            <Text variant="display-sm" numberOfLines={2}>{horse.name}</Text>
            {profileLine || trainerLine
              ? (
                  <View className="gap-1">
                    {profileLine
                      ? <Text testID="horse-card-profile-line" variant="body-sm" className="text-ink-variant">{profileLine}</Text>
                      : null}
                    {trainerLine
                      ? <Text variant="body-sm" className="font-sans-semibold text-label">{trainerLine}</Text>
                      : null}
                  </View>
                )
              : null}
            {horse.inviteOnly
              ? <Tag variant="ice" label={translate('stables.card.private')} testID="horse-card-private" />
              : null}
          </View>

          {declared
            ? (
                <View className="gap-1">
                  <DeclaredPill date={formatDeclaredDate(declared.race.postTime)} />
                  {follow ? <View className="flex-row">{follow}</View> : null}
                </View>
              )
            : (
                <View className="flex-row gap-1">
                  <StatusPill status={horse.status} className="flex-1" />
                  {follow}
                </View>
              )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
});
