import type { MemberContentScope } from '@/features/member-content/types';

import { useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { Bell } from '@/components/ui/icons';
import { useInboxBadge } from '@/features/notification-centre/api/use-inbox-badge';

export function formatBadge(count: number): string | null {
  if (count <= 0)
    return null;
  return count > 99 ? '99+' : String(count);
}

export function NotificationsBell({ scope }: { scope: MemberContentScope }) {
  const router = useRouter();
  const badge = formatBadge(useInboxBadge(scope).data ?? 0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge ? `Notifications, ${badge} new` : 'Notifications'}
      testID="home-bell"
      onPress={() => router.push('/notifications')}
      className="size-11 items-center justify-center rounded-full border border-neutral-400 bg-white"
    >
      <Bell color="#171717" />
      {badge
        ? (
            <View
              testID="home-bell-badge"
              className="absolute -top-1 -right-1 min-w-5 items-center rounded-full bg-violet-700 px-1.5 py-0.5"
            >
              <Text className="font-sans text-[10px] font-semibold text-white">{badge}</Text>
            </View>
          )
        : null}
    </Pressable>
  );
}
