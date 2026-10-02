import { Redirect, Tabs } from 'expo-router';
import * as React from 'react';

import { CustomTabBar } from '@/components/ui/tab-bar';
import { ArrivalSplash } from '@/features/arrival/arrival-splash';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';

export default function MemberLayout() {
  const status = useAuth.use.status();

  // Auth still hydrating: show the launch splash (frame 1) instead of a blank screen.
  if (status === 'idle') {
    return <ArrivalSplash />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="stables" options={{ title: 'Stables' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="paddock" options={{ title: 'The Paddock' }} />
    </Tabs>
  );
}
