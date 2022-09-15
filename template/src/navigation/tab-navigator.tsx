import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ComponentType } from 'react';
import * as React from 'react';
import type { SvgProps } from 'react-native-svg';

import { Feed, Settings, Style } from '@/screens';
import { COLORS, Feed as FeedIcon, Settings as SettingsIcon } from '@/ui';

type TabParamList = {
  Style: undefined;
  Feed: undefined;
  Settings: undefined;
};

type TabType = {
  name: keyof TabParamList;
  component: ComponentType<any>;
  label: string;
};

type TabIconsType = {
  [key in keyof TabParamList]: (props: SvgProps) => JSX.Element;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabsIcons: TabIconsType = {
  Style: (props: SvgProps) => <FeedIcon {...props} />,
  Feed: (props: SvgProps) => <FeedIcon {...props} />,
  Settings: (props: SvgProps) => <SettingsIcon {...props} />,
};

export type TabList<T extends keyof TabParamList> = {
  navigation: StackNavigationProp<TabParamList, T>;
  route: RouteProp<TabParamList, T>;
};

const tabs: TabType[] = [
  {
    name: 'Style',
    component: Style,
    label: 'Style',
  },
  {
    name: 'Feed',
    component: Feed,
    label: 'Feed',
  },
  {
    name: 'Settings',
    component: Settings,
    label: 'Settings',
  },
];

type BarIconType = {
  name: keyof TabParamList;
  color: string;
};

const BarIcon = ({ color, name, ...reset }: BarIconType) => {
  const Icon = tabsIcons[name];
  return <Icon color={color} {...reset} />;
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color }) => <BarIcon name={route.name} color={color} />,
        tabBarActiveTintColor: COLORS.WARM_PINK,
        tabBarInactiveTintColor: COLORS.SLATE_GREY,
        tabBarStyle: [
          { backgroundColor: COLORS.WHITE },
          { borderTopWidth: 1, borderTopColor: COLORS.SILVER },
        ],
      })}
    >
      <Tab.Group
        screenOptions={{
          headerShown: false,
        }}
      >
        {tabs.map(({ name, component, label }) => {
          return (
            <Tab.Screen
              key={name}
              name={name}
              component={component}
              options={{
                title: label,
              }}
            />
          );
        })}
      </Tab.Group>
    </Tab.Navigator>
  );
};
