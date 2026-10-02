import { Stack, useRouter } from 'expo-router';

import { Submark } from '@/components/brand/logo';
import { colors, EmptyState, FocusAwareStatusBar, View } from '@/components/ui';
import { useScreenTopPadding } from '@/components/ui/screen-layout';

export function NotFoundScreen() {
  const router = useRouter();
  const topPadding = useScreenTopPadding(48);

  return (
    <View className="flex-1 bg-secondary-container px-4" style={{ paddingTop: topPadding }}>
      <Stack.Screen options={{ headerShown: false }} />
      <FocusAwareStatusBar />
      <View className="mb-6 items-center">
        <Submark width={48} color={colors.ink} />
      </View>
      <EmptyState
        testID="not-found"
        kicker="404"
        title="This page has bolted"
        body="We couldn't find what you were looking for."
        actionLabel="Back to Home"
        onAction={() => router.replace('/')}
      />
    </View>
  );
}
