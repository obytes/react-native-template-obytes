import type { LayoutChangeEvent } from 'react-native';
import type { HorseUpdate, HorseUpdateType } from '@/features/stables/types';
import type { TxKeyPath } from '@/lib/i18n';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Card, MonoLabel, Tag, Text } from '@/components/ui';
import { relativeTime } from '@/features/pulse/components/relative-time';
import { translate } from '@/lib/i18n';

type HorseUpdatesTimelineProps = {
  updates: HorseUpdate[] | undefined;
  /** Each card's y within the timeline (lets Wellbeing rows scroll to "the update"). */
  onItemLayout?: (updateId: string, y: number) => void;
};

// Body text collapses behind "Read more" past this many characters, with
// numberOfLines capping the collapsed rendering, to keep the timeline
// scannable when a post runs long.
const COLLAPSE_THRESHOLD = 220;
const COLLAPSED_LINES = 4;

const TYPE_LABELS: Record<HorseUpdateType, TxKeyPath> = {
  trainer: 'stables.detail.updateTypes.trainer',
  wellbeing: 'stables.detail.updateTypes.wellbeing',
  general: 'stables.detail.updateTypes.general',
  race: 'stables.detail.updateTypes.race',
};

function UpdateBody({ bodyText }: { bodyText: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = bodyText.length > COLLAPSE_THRESHOLD;

  return (
    <View className="gap-2">
      <Text
        variant="body"
        className="text-ink-variant"
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
              className="self-start"
            >
              <MonoLabel className="text-ink">
                {translate(expanded ? 'stables.detail.showLess' : 'stables.detail.readMore')}
              </MonoLabel>
            </Pressable>
          )
        : null}
    </View>
  );
}

function UpdateCard({ update, onLayout }: { update: HorseUpdate; onLayout?: (event: LayoutChangeEvent) => void }) {
  const typeLabel = update.updateType && TYPE_LABELS[update.updateType]
    ? translate(TYPE_LABELS[update.updateType])
    : null;
  return (
    <Card testID={`update-card-${update.id}`} onLayout={onLayout} className="gap-3 border border-outline-variant">
      <View className="flex-row items-center justify-between gap-3">
        {/* S8-05 category chip, restyled as a V2 tag. */}
        {typeLabel ? <Tag variant="ice" label={typeLabel} /> : <View />}
        <MonoLabel>{relativeTime(update.publishedAt)}</MonoLabel>
      </View>
      <Text variant="title">{update.title}</Text>
      <UpdateBody bodyText={update.bodyText} />
    </Card>
  );
}

/**
 * Horse updates (S13-04 detail §5), sourced from the "Horse updates"
 * (MemberPost) feature: one white card per update, newest first. Renders
 * nothing when there are no updates.
 */
export function HorseUpdatesTimeline({ updates, onItemLayout }: HorseUpdatesTimelineProps) {
  const items = updates ?? [];

  if (items.length === 0)
    return null;

  return (
    <View testID="updates-section" className="gap-2">
      <MonoLabel className="px-1 pt-2 pb-1">{translate('stables.detail.updatesLabel')}</MonoLabel>
      {items.map(update => (
        <UpdateCard
          key={update.id}
          update={update}
          onLayout={onItemLayout ? e => onItemLayout(update.id, e.nativeEvent.layout.y) : undefined}
        />
      ))}
    </View>
  );
}
