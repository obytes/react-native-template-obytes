import { Card, colors, MonoLabel, Text, View } from '@/components/ui';
import { StarV2 } from '@/components/ui/icons/v2';

export type JourneyBadge = 'founding-member';

/** "My Rionna journey" (frame 12). v1 shows the Founding Member badge only. */
export function JourneyCard({ badges }: { badges: JourneyBadge[] }) {
  if (badges.length === 0)
    return null;
  return (
    <Card variant="plum" testID="journey-card" className="gap-8">
      <MonoLabel tone="dark">My Rionna journey</MonoLabel>
      <View className="flex-row flex-wrap gap-1">
        {badges.includes('founding-member')
          ? (
              <View
                testID="badge-founding-member"
                className="flex-row items-center gap-2 rounded-md border border-on-primary-container bg-primary-fixed px-4 py-2 pl-2"
              >
                <StarV2 size={13} color={colors.plumMid} />
                <Text variant="body-sm" className="font-sans-semibold text-plum">Founding Member</Text>
              </View>
            )
          : null}
      </View>
    </Card>
  );
}
