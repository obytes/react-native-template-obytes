import type { Entry, HorseDetail } from '@/features/stables/types';

import * as React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import {
  colors,
  Dots,
  getInitials,
  Gradient,
  MonoLabel,
  PhotoFallback,
  Tag,
  Text,
} from '@/components/ui';
import { CaretRightV2 } from '@/components/ui/icons/v2';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { FollowToggle } from '@/features/stables/components/follow-toggle';
import { PhotoCarousel } from '@/features/stables/components/photo-carousel';
import { DeclaredPill, StatusPill } from '@/features/stables/components/status-pill';
import { formatDeclaredDate, getProfileLine, getTrainerLine } from '@/features/stables/lib/horse-facts';
import { tx } from '@/features/stables/lib/tx';
import { translate } from '@/lib/i18n';

export type HorseHeroProps = {
  horse: HorseDetail;
  declaredEntry?: Entry;
  followPending?: boolean;
  onToggleFollow: (following: boolean) => void;
  onBack: () => void;
  onShare: () => void;
};

const BACK_ICON_STYLE = { transform: [{ rotate: '180deg' }] };

/**
 * The photo layer, kept in its own view so S14-05 can attach the shared
 * element transition, parallax and stretch to it without touching the rest
 * of the hero. Several photos page inside it; none → navy pattern + initials.
 */
function HeroPhoto({ horse, onIndexChange }: { horse: HorseDetail; onIndexChange: (index: number) => void }) {
  return (
    <View testID="horse-hero-photo" style={StyleSheet.absoluteFill}>
      {horse.photos.length > 0
        ? <PhotoCarousel photos={horse.photos} onIndexChange={onIndexChange} />
        : (
            <View testID="horse-hero-fallback" style={StyleSheet.absoluteFill}>
              <PhotoFallback colourway="navy" tileSize={64} style={StyleSheet.absoluteFill} />
              <View pointerEvents="none" style={StyleSheet.absoluteFill} className="items-center justify-center">
                <Text variant="display-xl" className="text-on-primary opacity-80">{getInitials(horse.name)}</Text>
              </View>
            </View>
          )}
    </View>
  );
}

/**
 * Horse detail hero (S13-04 detail §1, Figma frame 7): full-bleed photo
 * under a light status bar with a navy scrim, white back/share bar, name,
 * ⏳profile line, trainer(, ⏳location), then the Declared/status pill and
 * the Follow toggle. Isolated so S14-05 can animate it.
 */
export function HorseHero({ horse, declaredEntry, followPending = false, onToggleFollow, onBack, onShare }: HorseHeroProps) {
  const { width } = useWindowDimensions();
  const topPadding = useScreenTopPadding(4);
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const profileLine = getProfileLine(horse);
  const trainerLine = getTrainerLine(horse);

  return (
    <View testID="horse-hero" className="overflow-hidden bg-primary" style={{ minHeight: width }}>
      <HeroPhoto horse={horse} onIndexChange={setPhotoIndex} />
      <Gradient variant="photo-scrim" pointerEvents="none" style={StyleSheet.absoluteFill} />

      <View
        pointerEvents="box-none"
        style={{ paddingTop: topPadding, minHeight: width }}
        className="justify-between gap-8 px-4 pb-8"
      >
        <View pointerEvents="box-none" className="h-11 flex-row items-center justify-between">
          <Pressable
            testID="horse-hero-back"
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={translate('stables.detail.backA11y')}
            hitSlop={12}
            className="-ml-1 flex-row items-center gap-1.5"
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <CaretRightV2 size={18} color={colors.white} style={BACK_ICON_STYLE} />
            <Text variant="body-sm" className="text-white">{translate('stables.detail.back')}</Text>
          </Pressable>
          <Pressable
            testID="horse-hero-share"
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel={tx('stables.detail.shareA11y', { name: horse.name })}
            hitSlop={12}
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <MonoLabel tone="white">{translate('stables.detail.share')}</MonoLabel>
          </Pressable>
        </View>

        <View pointerEvents="box-none" className="gap-6">
          <View pointerEvents="none" className="gap-2">
            <Text variant="display-lg" accessibilityRole="header" className="text-white">{horse.name}</Text>
            {profileLine
              ? <Text testID="horse-hero-profile-line" variant="body" className="text-white">{profileLine}</Text>
              : null}
            {trainerLine
              ? <Text testID="horse-hero-trainer" variant="body" className="text-white">{trainerLine}</Text>
              : null}
            {horse.inviteOnly
              ? <Tag variant="ice" label={translate('stables.card.private')} className="mt-1" />
              : null}
          </View>

          <View pointerEvents="box-none" className="flex-row gap-1">
            {declaredEntry
              ? <DeclaredPill date={formatDeclaredDate(declaredEntry.race.postTime)} className="flex-1" />
              : <StatusPill status={horse.status} tone="hero" className="flex-1" />}
            <FollowToggle
              testID="horse-hero-follow"
              tone="hero"
              className="flex-1"
              isFollowing={horse.isFollowing}
              pending={followPending}
              onToggle={onToggleFollow}
              confirmBeforeUnfollow={horse.inviteOnly ? { horseName: horse.name } : undefined}
            />
          </View>
        </View>
      </View>

      {horse.photos.length > 1
        ? (
            <View pointerEvents="none" className="absolute inset-x-0 bottom-3 items-center">
              <Dots testID="horse-hero-dots" count={horse.photos.length} index={photoIndex} />
            </View>
          )
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
});
