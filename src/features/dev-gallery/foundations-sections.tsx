import type { Colourway, TileKind } from '@/components/brand/pattern';
import type { GradientVariant, TextVariant } from '@/components/ui';
import * as React from 'react';
import { View } from 'react-native';

import { Submark, Wordmark } from '@/components/brand/logo';
import { COLOURWAYS, PatternTile } from '@/components/brand/pattern';
import { colors, Gradient, GRADIENTS, Text, TEXT_VARIANTS } from '@/components/ui';
import {
  BellV2,
  CalendarV2,
  CaretRightV2,
  ChatV2,
  HomeV2,
  HorseshoeV2,
  PencilV2,
  PlayV2,
  StarV2,
  WalletV2,
} from '@/components/ui/icons/v2';

import { Caption, Section } from './section';

export function TypeSection() {
  return (
    <Section title="Type ramp">
      {(Object.keys(TEXT_VARIANTS) as TextVariant[]).map(v => (
        <View key={v}>
          <Caption>{`${v} · ${TEXT_VARIANTS[v].fontSize}/${TEXT_VARIANTS[v].lineHeight}`}</Caption>
          <Text variant={v}>Ashfield Rose declares</Text>
        </View>
      ))}
    </Section>
  );
}

export function GradientSection() {
  return (
    <Section title="Gradients">
      <View className="flex-row flex-wrap gap-3">
        {(Object.keys(GRADIENTS) as GradientVariant[]).map(v => (
          <View key={v} className="w-[47%] gap-1">
            <View className={`h-24 overflow-hidden rounded-lg border border-outline-variant ${v === 'card-plum-glow' ? 'bg-plum' : v === 'card-sage-glow' ? 'bg-white' : v === 'photo-scrim' ? 'bg-ice' : ''}`}>
              <Gradient variant={v} style={{ flex: 1 }} />
            </View>
            <Caption>{v}</Caption>
          </View>
        ))}
      </View>
    </Section>
  );
}

const KINDS: TileKind[] = ['quad', 'gem', 'ring', 'harlequin'];

export function PatternSection() {
  return (
    <Section title="Pattern kinds × colourways">
      {(Object.keys(COLOURWAYS) as Colourway[]).map(colourway => (
        <View key={colourway} className="gap-1">
          <Caption>{colourway}</Caption>
          <View className="flex-row gap-2">
            {KINDS.map(kind => (
              <View key={kind} className="items-center gap-1">
                <PatternTile spec={{ kind, colourway, turn: 0 }} size={72} />
                <Caption>{kind}</Caption>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Section>
  );
}

export function LogoSection() {
  return (
    <Section title="Logos">
      <View className="flex-row items-center gap-6 rounded-lg bg-white p-4">
        <Wordmark width={180} />
        <Submark width={44} />
      </View>
      <View className="flex-row items-center gap-6 rounded-lg bg-primary p-4">
        <Wordmark width={180} color={colors.white} />
        <Submark width={44} color={colors.primaryFixed} />
      </View>
    </Section>
  );
}

const ICONS = { HomeV2, HorseshoeV2, ChatV2, CalendarV2, StarV2, BellV2, CaretRightV2, PlayV2, WalletV2, PencilV2 };

export function IconSection() {
  return (
    <Section title="V2 icons">
      <View className="flex-row flex-wrap gap-4">
        {Object.entries(ICONS).map(([name, Icon]) => (
          <View key={name} className="w-[60px] items-center gap-1">
            <Icon size={28} />
            <Caption>{name.replace('V2', '')}</Caption>
          </View>
        ))}
      </View>
    </Section>
  );
}
