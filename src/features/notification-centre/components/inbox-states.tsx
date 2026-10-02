import { ActivityIndicator, EmptyState, ErrorState, Text, View } from '@/components/ui';

export function InboxLoading() {
  return (
    <View testID="inbox-loading" className="mt-6 items-center py-16">
      <ActivityIndicator />
      <Text variant="body" className="mt-3 text-ink-variant">
        Loading notifications…
      </Text>
    </View>
  );
}

export function InboxEmpty() {
  return (
    <EmptyState
      testID="inbox-empty"
      title="You're all caught up"
      body="New activity from the club and your horses will show up here."
    />
  );
}

export function InboxUnavailable({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) {
  return (
    <ErrorState
      testID="inbox-unavailable"
      title="Notifications unavailable"
      body="Check your connection and try again shortly."
      onRetry={onRetry}
      retrying={retrying}
    />
  );
}
