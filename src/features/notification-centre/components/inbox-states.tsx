import { ActivityIndicator, Text, View } from '@/components/ui';

export function InboxLoading() {
  return (
    <View testID="inbox-loading" className="mt-6 items-center py-16">
      <ActivityIndicator color="#391d3a" />
      <Text className="mt-3 font-sans text-sm text-neutral-600">
        Loading notifications…
      </Text>
    </View>
  );
}

export function InboxEmpty() {
  return (
    <View testID="inbox-empty" className="mx-5 mt-6 rounded-2xl border border-neutral-300 bg-white p-6">
      <Text className="font-sans text-lg font-semibold text-ink">You're all caught up</Text>
      <Text className="mt-2 font-sans text-sm/5 text-neutral-600">
        New activity from the club and your horses will show up here.
      </Text>
    </View>
  );
}

export function InboxUnavailable() {
  return (
    <View testID="inbox-unavailable" className="mx-5 mt-6 rounded-2xl border border-neutral-300 bg-white p-6">
      <Text className="font-sans text-lg font-semibold text-ink">Notifications unavailable</Text>
      <Text className="mt-2 font-sans text-sm/5 text-neutral-600">
        Check your connection and try again shortly.
      </Text>
    </View>
  );
}
