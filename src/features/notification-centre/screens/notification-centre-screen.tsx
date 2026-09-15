import type { InboxItem } from '@/features/notification-centre/types';

import Env from 'env';
import { Stack, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, RefreshControl, SectionList, View } from 'react-native';

import { FocusAwareStatusBar, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useInbox } from '@/features/notification-centre/api/use-inbox';
import { useMarkAllRead, useMarkRead, useMarkSeen } from '@/features/notification-centre/api/use-inbox-actions';
import { InboxRow } from '@/features/notification-centre/components/inbox-row';
import { InboxEmpty, InboxLoading, InboxUnavailable } from '@/features/notification-centre/components/inbox-states';
import { groupInboxSections } from '@/features/notification-centre/lib/sections';
import { routeToTarget } from '@/features/notifications/deep-link';

function MarkAllHeaderAction({ onPress }: { onPress: () => void }) {
  return (
    <Text
      accessibilityRole="button"
      testID="inbox-mark-all"
      onPress={onPress}
      className="font-sans text-sm font-semibold text-violet-700"
    >
      Mark all as read
    </Text>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="bg-background px-5 pt-5 pb-2 font-mono text-[10px] tracking-widest text-violet-700 uppercase">
      {title}
    </Text>
  );
}

export function NotificationCentreScreen() {
  const user = useAuthStore.use.user();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: user?.id ?? '' }),
    [user?.id],
  );

  const inbox = useInbox(scope);
  const markRead = useMarkRead(scope);
  const markAll = useMarkAllRead(scope);
  const markSeen = useMarkSeen(scope);

  const items = React.useMemo(() => inbox.data?.pages.flatMap(page => page.items) ?? [], [inbox.data]);
  const sections = React.useMemo(() => groupInboxSections(items, new Date()), [items]);

  const markSeenMutate = markSeen.mutate;
  useFocusEffect(React.useCallback(() => {
    markSeenMutate();
  }, [markSeenMutate]));

  const handlePress = React.useCallback((item: InboxItem) => {
    if (item.unread)
      markRead.mutate(item.id);
    routeToTarget(item.data);
  }, [markRead]);

  const isLoading = inbox.isLoading && !inbox.data;
  const isUnavailable = inbox.isError && !inbox.data;
  const hasUnread = items.some(item => item.unread);

  return (
    <>
      <FocusAwareStatusBar />
      <Stack.Screen
        options={{
          headerRight: hasUnread ? () => <MarkAllHeaderAction onPress={() => markAll.mutate()} /> : undefined,
        }}
      />
      {isLoading
        ? <InboxLoading />
        : isUnavailable
          ? <InboxUnavailable />
          : items.length === 0
            ? <InboxEmpty />
            : (
                <SectionList
                  className="flex-1 bg-background"
                  sections={sections}
                  keyExtractor={item => item.id}
                  renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
                  renderItem={({ item }) => <InboxRow item={item} onPress={handlePress} />}
                  ItemSeparatorComponent={() => <View className="h-px bg-neutral-200" />}
                  refreshControl={(
                    <RefreshControl
                      refreshing={inbox.isRefetching && !inbox.isFetchingNextPage}
                      onRefresh={() => void inbox.refetch()}
                    />
                  )}
                  onEndReached={() => {
                    if (inbox.hasNextPage && !inbox.isFetchingNextPage)
                      void inbox.fetchNextPage();
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={inbox.isFetchingNextPage
                    ? (
                        <View className="items-center py-4">
                          <ActivityIndicator color="#391d3a" />
                        </View>
                      )
                    : null}
                  contentContainerStyle={{ paddingBottom: 32 }}
                  stickySectionHeadersEnabled={false}
                />
              )}
    </>
  );
}
