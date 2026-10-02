import { ActivityIndicator, Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

export function InboxLoading() {
  return (
    <View testID="inbox-loading" className="mt-6 items-center py-16">
      <ActivityIndicator color={colors.primary} />
      <Text className="mt-3 font-sans text-sm text-ink-variant">
        Loading notifications…
      </Text>
    </View>
  );
}

export function InboxEmpty() {
  return (
    <View testID="inbox-empty" className="mx-5 mt-6 rounded-2xl border border-outline-variant bg-white p-6">
      <Text className="font-sans-semibold text-lg text-ink">You're all caught up</Text>
      <Text className="mt-2 font-sans text-sm/5 text-ink-variant">
        New activity from the club and your horses will show up here.
      </Text>
    </View>
  );
}

export function InboxUnavailable() {
  return (
    <View testID="inbox-unavailable" className="mx-5 mt-6 rounded-2xl border border-outline-variant bg-white p-6">
      <Text className="font-sans-semibold text-lg text-ink">Notifications unavailable</Text>
      <Text className="mt-2 font-sans text-sm/5 text-ink-variant">
        Check your connection and try again shortly.
      </Text>
    </View>
  );
}
