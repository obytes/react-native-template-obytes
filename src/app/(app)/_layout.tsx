import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

import { Pressable, Text } from '@/components/ui';
import {
  Chat as ChatIcon,
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { BiometricLockScreen } from '@/features/auth/components/biometric-lock-screen';
import { useAuth, useBiometricLock } from '@/lib/auth';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

function RingIcon({ color }: { color?: string }) {
  return (
    <Text style={{ fontSize: 18, color: color ?? '#888' }}>💍</Text>
  );
}

export default function TabLayout() {
  const { isHydrated, isAuthenticated, status, signOut } = useAuth();
  const [isFirstTime] = useIsFirstTime();
  const biometricLock = useBiometricLock();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      const timer = setTimeout(() => {
        hideSplash();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    SplashScreen.hideAsync();
    return <Redirect href="/onboarding" />;
  }

  // Before hydrate completes, show nothing (splash is still visible)
  if (!isHydrated) {
    return null;
  }

  // Hydration is done. If not authenticated, redirect to login.
  if (!isAuthenticated) {
    SplashScreen.hideAsync();
    return <Redirect href="/login" />;
  }

  // Show biometric lock screen if locked
  if (biometricLock.isLocked) {
    return (
      <BiometricLockScreen
        onUnlock={biometricLock.unlock}
        isAuthenticating={biometricLock.isAuthenticating}
        error={biometricLock.error}
        onSignOut={signOut}
      />
    );
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          headerRight: () => <CreateNewPostLink />,
          tabBarButtonTestID: 'feed-tab',
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarIcon: ({ color }) => <ChatIcon color={color} />,
          tabBarButtonTestID: 'chat-tab',
        }}
      />

      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          headerShown: false,
          tabBarIcon: ({ color }) => <StyleIcon color={color} />,
          tabBarButtonTestID: 'style-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
      <Tabs.Screen
        name="ring-debug"
        options={{
          title: 'Ring',
          headerShown: false,
          tabBarIcon: ({ color }) => <RingIcon color={color} />,
          tabBarButtonTestID: 'ring-debug-tab',
        }}
      />
    </Tabs>
  );
}

function CreateNewPostLink() {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
}
