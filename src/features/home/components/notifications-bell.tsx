import type { MemberContentScope } from '@/features/member-content/types';

import { useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';
import { BellV2 } from '@/components/ui/icons/v2';
import { useInboxBadge } from '@/features/notification-centre/api/use-inbox-badge';

const ICON_SIZE = 20;
// 1.4pt rendered stroke in the icon's 24-unit viewBox (tab-bar icon style).
const ICON_STROKE = (1.4 * 24) / ICON_SIZE;

export function formatBadge(count: number): string | null {
  if (count <= 0)
    return null;
  return count > 99 ? '99+' : String(count);
}

/** Home header bell (S13-03 §1): 41pt white circle with a hairline, lilac count pill. */
export function NotificationsBell({ scope }: { scope: MemberContentScope }) {
  const router = useRouter();
  const badge = formatBadge(useInboxBadge(scope).data ?? 0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge ? `Notifications, ${badge} unread` : 'Notifications'}
      testID="home-bell"
      hitSlop={2}
      onPress={() => router.push('/notifications')}
      className="size-[41px] items-center justify-center rounded-full border border-outline-variant bg-white"
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
    >
      <BellV2 size={ICON_SIZE} strokeWidth={ICON_STROKE} color={colors.ink} />
      {badge
        ? (
            <View
              testID="home-bell-badge"
              className="absolute -top-1.5 -right-1.5 h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-primary-fixed px-1"
            >
              <Text className="font-sans-semibold text-[10px]/[13px] text-plum" maxFontSizeMultiplier={1}>
                {badge}
              </Text>
            </View>
          )
        : null}
    </Pressable>
  );
}
