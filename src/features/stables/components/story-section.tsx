import type { PedigreeRow, PedigreeRowKey } from '@/features/stables/lib/horse-facts';
import type { TxKeyPath } from '@/lib/i18n';

import * as React from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Card, MonoLabel, Text } from '@/components/ui';
import { translate } from '@/lib/i18n';

type StorySectionProps = {
  /** Story text (`story`, falling back to `bio`). */
  story: string | null | undefined;
  pedigree: PedigreeRow[];
};

// Long stories collapse behind "Read more" to keep the profile scannable.
const COLLAPSE_THRESHOLD = 480;

const PEDIGREE_LABELS: Record<PedigreeRowKey, TxKeyPath> = {
  sire: 'stables.detail.pedigree.sire',
  dam: 'stables.detail.pedigree.dam',
  damsire: 'stables.detail.pedigree.damsire',
  foaled: 'stables.detail.pedigree.foaled',
};

/**
 * Pedigree row (Figma frame 7): mono label left, body value right, ice
 * hairline between rows. Feature-local rather than `ListRow`, whose label
 * is `body-lg` (the frame uses a mono label here).
 */
function PedigreeRowView({ row, divider }: { row: PedigreeRow; divider: boolean }) {
  const label = translate(PEDIGREE_LABELS[row.key]);
  return (
    <View
      testID={`pedigree-${row.key}`}
      accessible
      accessibilityLabel={`${label}, ${row.value}`}
      className={twMerge('min-h-9 flex-row items-center justify-between gap-4 py-2', divider && 'border-b border-ice')}
    >
      <MonoLabel className="text-ink">{label}</MonoLabel>
      <Text variant="body" className="shrink text-right text-label">{row.value}</Text>
    </View>
  );
}

/**
 * "Story & pedigree" white card (S13-04 detail §3). Renders nothing when
 * the horse has neither a story nor any pedigree row.
 */
export function StorySection({ story, pedigree }: StorySectionProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!story && pedigree.length === 0)
    return null;

  const isLong = !!story && story.length > COLLAPSE_THRESHOLD;
  const shownStory = isLong && !expanded ? `${story.slice(0, COLLAPSE_THRESHOLD).trimEnd()}…` : story;

  return (
    <Card testID="story-section" className="gap-4 border border-outline-variant">
      <MonoLabel>{translate('stables.detail.storyLabel')}</MonoLabel>

      {shownStory
        ? (
            <View className="gap-2">
              <Text variant="body-lg" className="text-ink-variant">{shownStory}</Text>
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
          )
        : null}

      {pedigree.length > 0
        ? (
            <View>
              {pedigree.map((row, i) => (
                <PedigreeRowView key={row.key} row={row} divider={i < pedigree.length - 1} />
              ))}
            </View>
          )
        : null}
    </Card>
  );
}
