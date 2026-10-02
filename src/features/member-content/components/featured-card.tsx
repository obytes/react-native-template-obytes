import type { TileSpec } from '@/components/brand/pattern';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { PatternFill } from '@/components/brand/pattern';
import { Card, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { CaretRightV2 } from '@/components/ui/icons/v2';

const STRIP_PATTERN: TileSpec = { kind: 'harlequin', colourway: 'cream', turn: 0 };

/** Featured card payload — arrives with S13-11 (Live Q&A). Nothing provides it yet. */
export type FeaturedCardData = {
  id: string;
  kicker: string;
  title: string;
  subtitle?: string;
};

/**
 * Live Q&A style featured card (cream pattern strip, kicker, `display-sm`
 * title, chevron). Slot only: renders nothing without data (S13-11).
 */
export function FeaturedCard({ card, onPress }: { card: FeaturedCardData | null | undefined; onPress?: (id: string) => void }) {
  if (!card) {
    return null;
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={card.title} onPress={() => onPress?.(card.id)}>
      <Card noPadding testID="featured-card" className="flex-row border border-outline-variant">
        <PatternFill spec={STRIP_PATTERN} tileSize={36} style={{ width: 36 }} />
        <View className="flex-1 gap-1 p-4">
          <Text variant="body-sm" className="text-label">{card.kicker}</Text>
          <Text variant="display-sm">{card.title}</Text>
          {card.subtitle ? <Text variant="body-sm" className="text-ink-variant">{card.subtitle}</Text> : null}
        </View>
        <View className="justify-center pr-4">
          <CaretRightV2 size={20} color={colors.ink} />
        </View>
      </Card>
    </Pressable>
  );
}
