import type { HorseUpdate, HorseUpdateType } from '@/features/stables/types';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';
import { relativeTime } from '@/features/pulse/components/relative-time';

type HorseUpdatesTimelineProps = {
  updates: HorseUpdate[] | undefined;
};

// Body text collapses behind "Read more" past this many characters (same
// heuristic as StorySection's COLLAPSE_THRESHOLD) with numberOfLines used
// to cap the collapsed rendering, to keep the timeline scannable when a
// post runs long.
const COLLAPSE_THRESHOLD = 220;
const COLLAPSED_LINES = 4;

const TYPE_LABELS: Record<HorseUpdateType, string> = {
  trainer: 'Trainer',
  wellbeing: 'Wellbeing',
  general: 'General',
  race: 'Race notes',
};

function TypeChip({ type }: { type: HorseUpdateType }) {
  return (
    <View className="self-start rounded-full bg-muted px-3 py-1">
      <Text className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
        {TYPE_LABELS[type] ?? type}
      </Text>
    </View>
  );
}

function UpdateBody({ bodyText }: { bodyText: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = bodyText.length > COLLAPSE_THRESHOLD;

  return (
    <View>
      <Text
        className="font-sans text-sm/relaxed text-ink"
        numberOfLines={isLong && !expanded ? COLLAPSED_LINES : undefined}
      >
        {bodyText}
      </Text>
      {isLong
        ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(prev => !prev)}
              hitSlop={8}
              className="mt-1"
            >
              <Text className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )
        : null}
    </View>
  );
}

function UpdateRow({ update }: { update: HorseUpdate }) {
  return (
    <View className="gap-2 border-b border-muted py-4 last:border-b-0 last:pb-0">
      <View className="flex-row items-center justify-between">
        {update.updateType ? <TypeChip type={update.updateType} /> : <View />}
        <Text className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          {relativeTime(update.publishedAt)}
        </Text>
      </View>
      <Text className="font-sans text-base font-medium text-ink">
        {update.title}
      </Text>
      <UpdateBody bodyText={update.bodyText} />
    </View>
  );
}

/**
 * Horse profile timeline, sourced from the "Horse updates" (MemberPost)
 * feature. Renders nothing when there are no updates.
 */
export function HorseUpdatesTimeline({ updates }: HorseUpdatesTimelineProps) {
  const items = updates ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <View className="rounded-2xl bg-card p-6">
      <Text className="mb-4 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Updates
      </Text>
      <View>
        {items.map(update => (
          <UpdateRow key={update.id} update={update} />
        ))}
      </View>
    </View>
  );
}
