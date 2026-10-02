import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { View } from 'react-native';

import { CustomTabBar } from '@/components/ui/tab-bar';

import { Caption, Section } from './section';

const ROUTES = [
  { key: 'index', name: 'index', title: 'Home' },
  { key: 'stables', name: 'stables', title: 'Stables' },
  { key: 'community', name: 'community', title: 'Community' },
  { key: 'events', name: 'events', title: 'Events' },
  { key: 'paddock', name: 'paddock', title: 'The Paddock' },
];

/** The real tab bar driven by fake navigation props; tap to switch the active tab. */
function TabBarSpecimen({ initialIndex }: { initialIndex: number }) {
  const [index, setIndex] = React.useState(initialIndex);
  const props = {
    state: { index, routes: ROUTES.map(({ key, name }) => ({ key, name, params: undefined })) },
    descriptors: Object.fromEntries(ROUTES.map(r => [r.key, { options: { title: r.title } }])),
    navigation: {
      emit: () => ({ defaultPrevented: false }),
      navigate: (name: string) => setIndex(ROUTES.findIndex(r => r.name === name)),
    },
  } as unknown as BottomTabBarProps;
  return (
    <View className="h-[110px] overflow-visible">
      <CustomTabBar {...props} />
    </View>
  );
}

export function TabBarSection() {
  return (
    <Section title="Tab bar">
      <Caption>Home active</Caption>
      <TabBarSpecimen initialIndex={0} />
      <Caption>Community active (ring state, pending QA veto)</Caption>
      <TabBarSpecimen initialIndex={2} />
    </Section>
  );
}
