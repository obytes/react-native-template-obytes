import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import { useCallback, useEffect } from 'react';

import { useAuth } from '@/components/providers/auth';
import { useIsFirstTime } from '@/core';
import { Pressable, Text } from '@/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/ui/icons';

export default function TabLayout() {
  const { isAuthenticated, ready } = useAuth();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!ready) {
      hideSplash();
    }
  }, [hideSplash, ready]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (!isAuthenticated && ready) {
    return <Redirect href="/sign-in" />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          headerRight: () => <CreateNewPostLink />,
          tabBarTestID: 'feed-tab',
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          tabBarIcon: ({ color }) => <StyleIcon color={color} />,
          tabBarTestID: 'style-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

const CreateNewPostLink = () => (
  <Link href="/feed/add-post" asChild>
    <Pressable>
      <Text className="px-3 text-primary-300">Create</Text>
    </Pressable>
  </Link>
);
