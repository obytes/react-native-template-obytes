import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { IconV2Props } from '@/components/ui/icons/v2';

import * as React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import colors from '@/components/ui/colors';
import { withAlpha } from '@/components/ui/gradient-styles';
import {
  CalendarV2,
  ChatV2,
  HomeV2,
  HorseshoeV2,
  StarV2,
} from '@/components/ui/icons/v2';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_MIN_SIDE_MARGIN,
  TAB_BAR_WIDTH,
  useTabBarBottomOffset,
} from '@/components/ui/tab-bar-layout';

/**
 * Design V2 floating tab bar (S13-01 §8, Figma "tab bar" node 5:201).
 *
 * 350×60 pill, white @95%, 1pt ink @12% border, r30, shadow 0/12/40 ink @12%,
 * padding 7/17.6. Tabs are 44×44 r22: active = navy fill + white icon,
 * inactive = ink-variant icon. Community (centre) is always a raised 52×52
 * lilac circle with a plum-mid icon and shadow 0/6/18 plum-mid @25%; when
 * active its icon darkens to plum and it gains a 2pt plum-mid ring (not in
 * the design; pending Tom's QA veto). Shadows use `boxShadow` so iOS and
 * Android render the same. No motion (S14-02).
 */

const ICONS: Record<string, React.ComponentType<IconV2Props>> = {
  index: HomeV2,
  stables: HorseshoeV2,
  community: ChatV2,
  events: CalendarV2,
  paddock: StarV2,
};

const CENTRE_ROUTE = 'community';

const styles = StyleSheet.create({
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: withAlpha(colors.white, 0.95),
    boxShadow: `0px 12px 40px ${withAlpha(colors.ink, 0.12)}`,
    paddingVertical: 7,
    paddingHorizontal: 17.6,
  },
  tab: { width: 44, height: 44, borderRadius: 22 },
  centre: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryFixed,
    boxShadow: `0px 6px 18px ${withAlpha(colors.plumMid, 0.25)}`,
  },
  centreActive: { borderWidth: 2, borderColor: colors.plumMid },
});

type TabButtonProps = {
  routeName: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  testID?: string;
};

function TabButton({ routeName, label, focused, onPress, onLongPress, testID }: TabButtonProps) {
  const Icon = ICONS[routeName] ?? HomeV2;
  const isCentre = routeName === CENTRE_ROUTE;

  let iconColor: string = focused ? colors.onPrimary : colors.inkVariant;
  if (isCentre)
    iconColor = focused ? colors.plum : colors.plumMid;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      className="items-center justify-center"
      style={({ pressed }) => [
        isCentre ? [styles.centre, focused && styles.centreActive] : [styles.tab, focused && { backgroundColor: colors.primary }],
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon size={24} color={iconColor} />
    </Pressable>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const bottomOffset = useTabBarBottomOffset();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(TAB_BAR_WIDTH, screenWidth - TAB_BAR_MIN_SIDE_MARGIN * 2);

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 items-center"
      style={{ bottom: bottomOffset }}
    >
      <View
        testID="tab-bar"
        accessibilityRole="tablist"
        className="flex-row items-center justify-between"
        style={[styles.bar, { width }]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented)
              navigation.navigate(route.name, route.params);
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabButton
              key={route.key}
              routeName={route.name}
              label={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
              focused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              testID={options.tabBarButtonTestID}
            />
          );
        })}
      </View>
    </View>
  );
}
