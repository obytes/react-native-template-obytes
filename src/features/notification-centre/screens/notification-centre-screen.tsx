import type { InboxItem } from '@/features/notification-centre/types';

import Env from 'env';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import { RefreshControl, SectionList, View } from 'react-native';

import { ActivityIndicator, FocusAwareStatusBar, MonoLabel, ScrollView } from '@/components/ui';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useInbox } from '@/features/notification-centre/api/use-inbox';
import { useMarkAllRead, useMarkRead, useMarkSeen } from '@/features/notification-centre/api/use-inbox-actions';
import { MenuButton, MenuSheet } from '@/features/notification-centre/components/header-menu';
import { InboxRow } from '@/features/notification-centre/components/inbox-row';
import { InboxEmpty, InboxLoading, InboxUnavailable } from '@/features/notification-centre/components/inbox-states';
import { PreferencesCard } from '@/features/notification-centre/components/preferences-card';
import { groupInboxSections } from '@/features/notification-centre/lib/sections';
import { isPushData, routeToTarget } from '@/features/notifications/deep-link';
import { PageHeader } from '@/features/settings/components/page-header';

// ScreenHeader's kicker row is 44pt tall.
const HEADER_ROW_HEIGHT = 44;

function SectionHeader({ title }: { title: string }) {
  return <MonoLabel className="px-4 pt-5 pb-3">{title}</MonoLabel>;
}

function ItemGap() {
  return <View className="h-3" />;
}

export function NotificationCentreScreen() {
  const user = useAuthStore.use.user();
  const topPadding = useScreenTopPadding();
  const [menuOpen, setMenuOpen] = React.useState(false);
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
    if (isPushData(item.data))
      routeToTarget(item.data);
  }, [markRead]);

  const isLoading = inbox.isLoading && !inbox.data;
  const isUnavailable = inbox.isError && !inbox.data;
  const hasUnread = items.some(item => item.unread);
  const toggleMenu = React.useCallback(() => setMenuOpen(open => !open), []);

  let body: React.ReactNode;
  if (isLoading) {
    body = <InboxLoading />;
  }
  else if (isUnavailable || items.length === 0) {
    body = (
      <ScrollView contentContainerClassName="gap-4 px-4 pt-6 pb-10">
        {isUnavailable
          ? <InboxUnavailable onRetry={() => void inbox.refetch()} retrying={inbox.isRefetching} />
          : <InboxEmpty />}
        {isUnavailable ? null : <PreferencesCard />}
      </ScrollView>
    );
  }
  else {
    body = (
      <SectionList
        className="flex-1"
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
        renderItem={({ item }) => (
          <View className="px-4">
            <InboxRow item={item} onPress={handlePress} />
          </View>
        )}
        ItemSeparatorComponent={ItemGap}
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
        ListFooterComponent={(
          <View className="gap-4 px-4 pt-6">
            {inbox.isFetchingNextPage ? <ActivityIndicator /> : null}
            <PreferencesCard />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
      />
    );
  }

  return (
    <View className="flex-1 bg-secondary-container">
      <FocusAwareStatusBar />
      <PageHeader
        kicker="Notifications"
        right={hasUnread ? <MenuButton onPress={toggleMenu} expanded={menuOpen} /> : undefined}
      />
      {body}
      {menuOpen && hasUnread
        ? (
            <MenuSheet
              top={topPadding + HEADER_ROW_HEIGHT}
              onDismiss={() => setMenuOpen(false)}
              onMarkAllRead={() => markAll.mutate()}
            />
          )
        : null}
    </View>
  );
}
