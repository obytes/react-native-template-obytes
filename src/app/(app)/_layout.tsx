/* eslint-disable react/no-unstable-nested-components */
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

import {
  FireIcon,
  HomeIcon,
  LightbulbIcon,
  ProfileIcon,
  RefrigeratorIcon,
} from '../../../assets/icons';
import { View } from '@/components/ui';
import { useAuth, useIsFirstTime } from '@/lib';

const TAB_ACTIVE_COLOR = '#E8734A';
const TAB_INACTIVE_COLOR = '#9D9D9D';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 0);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_ACTIVE_COLOR,
        tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => (
            <HomeIcon width={22} height={22} fill={color} />
          ),
          tabBarButtonTestID: 'home-tab',
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Gợi ý',
          tabBarIcon: ({ color }) => (
            <LightbulbIcon width={22} height={22} fill={color} />
          ),
          tabBarButtonTestID: 'discover-tab',
        }}
      />

      <Tabs.Screen
        name="cooking"
        options={{
          title: 'Nấu ăn',
          tabBarIcon: ({ focused }) => (
            <View
              className={`absolute -top-7 items-center justify-center rounded-full ${
                focused ? 'bg-[#D4623D]' : 'bg-[#E8734A]'
              } h-14 w-14 shadow-lg shadow-orange-400/40`}
            >
              <FireIcon width={28} height={28} fill="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
          tabBarButtonTestID: 'cooking-tab',
        }}
      />

      <Tabs.Screen
        name="fridge"
        options={{
          title: 'Tủ lạnh',
          tabBarIcon: ({ color }) => (
            <RefrigeratorIcon width={20} height={20} fill={color} />
          ),
          tabBarButtonTestID: 'fridge-tab',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => (
            <ProfileIcon width={22} height={22} stroke={color} fill="none" />
          ),
          tabBarButtonTestID: 'profile-tab',
        }}
      />
    </Tabs>
  );
}
