import type { ButtonSize, ButtonVariant, IconButtonVariant } from '@/components/ui';
import * as React from 'react';
import { View } from 'react-native';

import {
  Button,
  Chip,
  ChipRow,
  colors,
  IconButton,
  Input,
} from '@/components/ui';
import { PencilV2, PlayV2, WalletV2 } from '@/components/ui/icons/v2';

import { Caption, Section } from './section';

const LIGHT_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'accent', 'destructive'];
const DARK_VARIANTS: ButtonVariant[] = ['on-dark', 'ghost-on-dark', 'accent'];
const SIZES: ButtonSize[] = ['lg', 'md', 'sm'];

export function ButtonSection() {
  return (
    <Section title="Button">
      {LIGHT_VARIANTS.map(variant => (
        <View key={variant} className="gap-1">
          <Caption>{variant}</Caption>
          <View className="flex-row flex-wrap items-center gap-2">
            {SIZES.map(size => (
              <Button key={size} variant={variant} size={size} fullWidth={false} label={`Join the club ${size.toUpperCase()}`} />
            ))}
          </View>
        </View>
      ))}
      <View className="gap-2 rounded-lg bg-primary p-4">
        <Caption>on navy: on-dark / ghost-on-dark / accent</Caption>
        <View className="flex-row flex-wrap items-center gap-2">
          {DARK_VARIANTS.map(variant => (
            <Button key={variant} variant={variant} size="md" fullWidth={false} label="Read the update" />
          ))}
        </View>
      </View>
      <Caption>full width · disabled · loading · legacy ghost</Caption>
      <Button label="Full width primary" />
      <Button label="Disabled" disabled />
      <Button label="Loading" loading />
      <Button variant="secondary" label="Loading" loading />
      <Button variant="ghost" label="Sign out (legacy ghost)" />
    </Section>
  );
}

const ICON_BUTTONS: { variant: IconButtonVariant; icon: React.ReactNode }[] = [
  { variant: 'square', icon: <WalletV2 size={20} color={colors.white} /> },
  { variant: 'square-accent', icon: <WalletV2 size={20} color={colors.plum} /> },
  { variant: 'circle', icon: <PlayV2 size={14} color={colors.ink} /> },
  { variant: 'circle-light', icon: <PencilV2 size={20} color={colors.ink} /> },
];

export function IconButtonSection() {
  return (
    <Section title="IconButton">
      <View className="flex-row items-center gap-4">
        {ICON_BUTTONS.map(({ variant, icon }) => (
          <View key={variant} className="items-center gap-1">
            <IconButton variant={variant} accessibilityLabel={variant}>{icon}</IconButton>
            <Caption>{variant}</Caption>
          </View>
        ))}
      </View>
    </Section>
  );
}

const ROW_ITEMS = [
  { key: 'race', label: 'Race day', count: 3 },
  { key: 'mentions', label: 'Mentions' },
  { key: 'unread', label: 'Unread', count: 3 },
  { key: 'events', label: 'Events' },
];

export function ChipSection() {
  const [selected, setSelected] = React.useState('race');
  return (
    <Section title="Chip / ChipRow">
      <View className="flex-row flex-wrap gap-2">
        <Chip label="Selected" selected />
        <Chip label="Selected" count={3} selected />
        <Chip label="Unselected" />
        <Chip label="Unselected" count={3} />
      </View>
      <Caption>ChipRow (single select, scrolls)</Caption>
      <ChipRow items={ROW_ITEMS} selectedKey={selected} onSelect={setSelected} />
    </Section>
  );
}

export function FormFieldSection() {
  return (
    <Section title="FormField">
      <Caption>light (in-app forms)</Caption>
      <Input label="Current password" placeholder="lorem ipsum" />
      <Input label="With error" placeholder="lorem ipsum" error="Passwords don't match" />
      <View className="gap-2 rounded-lg bg-primary p-4">
        <Caption>dark (login, on navy)</Caption>
        <Input tone="dark" placeholder="Email address" />
        <Input tone="dark" placeholder="Password" secureTextEntry />
      </View>
    </Section>
  );
}
