import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import colors from '@/components/ui/colors';
import {
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Horse as HorseIcon,
  Rosette as RosetteIcon,
  Users as UsersIcon,
} from '@/components/ui/icons';
import { useTabBarBottomOffset } from '@/components/ui/tab-bar-layout';

// Floating bar metrics live in tab-bar-layout.ts for import from full-bleed screens.

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const bottomOffset = useTabBarBottomOffset();

  return (
    <View
      className="absolute inset-x-6 flex-row items-center justify-between rounded-full bg-white/80 px-6 py-4 shadow-lg shadow-ink/5"
      style={{ bottom: bottomOffset }}
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

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        let Icon = HomeIcon;
        if (route.name === 'stables')
          Icon = HorseIcon;
        if (route.name === 'community')
          Icon = UsersIcon;
        if (route.name === 'events')
          Icon = CalendarIcon;
        if (route.name === 'paddock')
          Icon = RosetteIcon;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            testID={options.tabBarButtonTestID}
            className={`items-center justify-center rounded-full p-3 ${isFocused ? 'bg-primary shadow-md' : ''}`}
          >
            <Icon color={isFocused ? colors.onPrimary : colors.inkVariant} />
          </Pressable>
        );
      })}
    </View>
  );
}
