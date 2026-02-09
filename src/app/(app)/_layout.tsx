import { SplashScreen, Tabs } from 'expo-router';
import { useEffect } from 'react';

import {
  Feed as FeedIcon,
  Rate as RateIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
  Support as SupportIcon,
  Website as WebsiteIcon,
} from '@/components/ui/icons';

export default function TabLayout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <RateIcon color={color} />,
          tabBarButtonTestID: 'shop-tab',
        }}
      />
      <Tabs.Screen
        name="hoc"
        options={{
          title: 'Học',
          tabBarIcon: ({ color }) => <SupportIcon color={color} />,
          tabBarButtonTestID: 'hoc-tab',
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Ôn tập',
          tabBarIcon: ({ color }) => <WebsiteIcon color={color} />,
          tabBarButtonTestID: 'review-tab',
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
    </Tabs>
  );
}
