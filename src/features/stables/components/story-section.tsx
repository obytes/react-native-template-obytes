import type { HorsePedigree } from '@/features/stables/types';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';

type StorySectionProps = {
  story: string | null | undefined;
  pedigree: HorsePedigree | null | undefined;
};

// Long stories collapse behind "Read more" to keep the profile scannable.
const COLLAPSE_THRESHOLD = 320;

function PedigreeRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        {label}
      </Text>
      <Text className="font-sans text-sm text-ink">{value}</Text>
    </View>
  );
}

/**
 * "Story & Pedigree" module -- long-form narrative (collapsible past
 * COLLAPSE_THRESHOLD chars) plus sire/dam/damsire, when present. Renders
 * nothing when the horse has neither, so it never leaves an empty card in
 * the Detail Modules list.
 */
export function StorySection({ story, pedigree }: StorySectionProps) {
  const [expanded, setExpanded] = React.useState(false);
  const pedigreeEntries = [
    pedigree?.sire ? ['Sire', pedigree.sire] : null,
    pedigree?.dam ? ['Dam', pedigree.dam] : null,
    pedigree?.damsire ? ['Damsire', pedigree.damsire] : null,
  ].filter((entry): entry is [string, string] => entry !== null);

  if (!story && pedigreeEntries.length === 0) {
    return null;
  }

  const isLong = !!story && story.length > COLLAPSE_THRESHOLD;
  const shownStory = isLong && !expanded ? `${story.slice(0, COLLAPSE_THRESHOLD).trimEnd()}...` : story;

  return (
    <View className="rounded-2xl bg-card p-6">
      <Text className="mb-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        Story & Pedigree
      </Text>

      {shownStory
        ? (
            <Text className="mb-2 font-sans text-base/relaxed text-ink">
              {shownStory}
            </Text>
          )
        : null}

      {isLong
        ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(prev => !prev)}
              hitSlop={8}
              className="mb-2"
            >
              <Text className="font-mono text-[10px] tracking-widest text-primary uppercase">
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )
        : null}

      {pedigreeEntries.length > 0
        ? (
            <View className={story ? 'mt-4 border-t border-muted pt-4' : ''}>
              {pedigreeEntries.map(([label, value]) => (
                <PedigreeRow key={label} label={label} value={value} />
              ))}
            </View>
          )
        : null}
    </View>
  );
}
