import type { FallbackColourway } from '@/components/ui';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ActivityIndicator,
  Avatar,
  Card,
  colors,
  Dots,
  EmptyState,
  ErrorState,
  ListRow,
  MonoLabel,
  PhotoFallback,
  ProgressBar,
  ScreenHeader,
  Tag,
  Text,
} from '@/components/ui';
import { StarV2 } from '@/components/ui/icons/v2';

import { Caption, Section } from './section';

const PHOTO = 'https://picsum.photos/seed/rionna/800/500';

export function CardSection() {
  return (
    <Section title="Card">
      <Card>
        <MonoLabel>white</MonoLabel>
        <Text variant="display-sm">Upcoming events</Text>
      </Card>
      <Card variant="navy" className="gap-4">
        <Text variant="display-md" className="text-primary-fixed">
          {'Ashfield Rose declares '}
          <Text variant="display-md" className="text-on-primary">for Leopardstown</Text>
        </Text>
        <Dots count={3} index={0} />
      </Card>
      <Card variant="plum" className="h-[180px] justify-between">
        <MonoLabel tone="white">Charity snapshot</MonoLabel>
        <Text variant="display-xl" className="text-primary-fixed">€24,500</Text>
      </Card>
      <Card variant="forest" className="h-[180px] justify-between">
        <MonoLabel tone="white">Raised together, to date</MonoLabel>
        <Text variant="display-xl" className="text-primary-fixed">€24,500</Text>
      </Card>
      <Card variant="sage" pattern={{ kind: 'harlequin', colourway: 'green', turn: 0 }} className="h-[140px] justify-end">
        <Text variant="display-sm" className="text-forest">Member vote (faint pattern)</Text>
      </Card>
      <Card variant="sage" className="h-[140px] justify-end">
        <Text variant="display-sm" className="text-forest">Which cause should we back next season?</Text>
      </Card>
      <Card variant="photo" image={PHOTO} className="h-[180px] justify-between">
        <View className="gap-2">
          <MonoLabel tone="white">Inside track</MonoLabel>
          <Text variant="display-md" className="text-white">How a filly is named</Text>
        </View>
        <View className="flex-row justify-end gap-1.5">
          <Tag variant="ice" label="NEW" />
          <Tag variant="ice-outline" label="4 min watch" />
        </View>
      </Card>
      <Caption>photo card, broken image → cream fallback</Caption>
      <Card variant="photo" image="https://invalid.example/nope.jpg" className="h-[120px]" />
    </Section>
  );
}

export function LabelSection() {
  return (
    <Section title="MonoLabel / Tag">
      <MonoLabel>Today at the yard (label-sm)</MonoLabel>
      <MonoLabel size="md">Shop (label)</MonoLabel>
      <View className="rounded-lg bg-primary p-3"><MonoLabel tone="dark">On dark</MonoLabel></View>
      <View className="flex-row flex-wrap gap-2">
        <Tag label="NEW" />
        <Tag variant="ice" label="NEW" />
        <Tag variant="navy" label="Active" />
        <View className="rounded-sm bg-primary p-1"><Tag variant="ice-outline" label="4 min watch" /></View>
      </View>
    </Section>
  );
}

export function ListRowSection() {
  return (
    <Section title="ListRow">
      <Card>
        <MonoLabel>Membership</MonoLabel>
        <ListRow label="Status" value={<Tag variant="navy" label="Active" />} />
        <ListRow label="Renews" value={<MonoLabel className="text-forest">1 March 2027</MonoLabel>} />
        <ListRow label="Payment history" chevron onPress={() => {}} />
        <ListRow label="Sire" value="Sea The Stars" divider={false} />
      </Card>
    </Section>
  );
}

export function HeaderSection() {
  return (
    <Section title="ScreenHeader">
      <View className="rounded-lg border border-outline-variant">
        <ScreenHeader safeArea={false} kicker="Profile" onBack={() => {}} title="Sarah Kavanagh" />
      </View>
      <View className="rounded-lg border border-outline-variant pb-2">
        <ScreenHeader safeArea={false} variant="tab-root" brand right={<Avatar name="Sarah Kavanagh" ring />} title="Good morning, Sarah" />
      </View>
      <View className="rounded-lg border border-outline-variant pb-2">
        <ScreenHeader safeArea={false} variant="tab-root" title="Our Stables" subtitle="Every horse in our club, follow the ones you love." />
      </View>
    </Section>
  );
}

const CHARITY_THUMB = () => <StarV2 size={22} color={colors.white} />;

export function ProgressSection() {
  return (
    <Section title="Dots / ProgressBar">
      <View className="flex-row gap-6">
        <Dots count={3} index={0} />
        <Dots count={5} index={2} />
      </View>
      <ProgressBar value={60} accessibilityLabel="Spots" />
      <ProgressBar value={35} height={4} />
      <Card variant="plum"><ProgressBar value={68} tone="on-plum" renderThumb={CHARITY_THUMB} /></Card>
      <View className="overflow-hidden rounded-lg p-4">
        <PhotoFallback colourway="green" style={StyleSheet.absoluteFill} />
        <ProgressBar value={68} tone="on-dark" renderThumb={CHARITY_THUMB} />
      </View>
    </Section>
  );
}

const COLOURWAYS: FallbackColourway[] = ['navy', 'green', 'plum', 'cream'];

export function AvatarSection() {
  return (
    <Section title="Avatar / PhotoFallback">
      <View className="flex-row items-center gap-3">
        <Avatar name="Sarah Kavanagh" />
        <Avatar name="Sarah Kavanagh" ring />
        <Avatar name="Sarah" uri="https://picsum.photos/seed/sarah/200" ring />
        <Avatar name="Ashfield Rose" kind="horse" />
        <Avatar name="Midnight Tempo" kind="horse" size={64} />
      </View>
      <View className="flex-row gap-2">
        {COLOURWAYS.map(c => (
          <View key={c} className="items-center gap-1">
            <PhotoFallback colourway={c} initials="AR" borderRadius={8} style={{ width: 80, height: 100 }} />
            <Caption>{c}</Caption>
          </View>
        ))}
      </View>
    </Section>
  );
}

export function StateSection() {
  return (
    <Section title="EmptyState / ErrorState / loading">
      <EmptyState kicker="My horses" title="No horses followed yet" body="Follow a horse from Stables to see it here." actionLabel="Browse stables" onAction={() => {}} />
      <ErrorState onRetry={() => {}} />
      <View className="flex-row gap-4">
        <ActivityIndicator />
        <ActivityIndicator size="large" />
      </View>
    </Section>
  );
}
