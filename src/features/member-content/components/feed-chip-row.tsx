import type { FeedChip } from '@/features/member-content/types';

import * as React from 'react';

import { ChipRow } from '@/components/ui';

type FeedChipRowProps = {
  chips: FeedChip[];
  selectedId: string;
  onSelect: (id: string) => void;
  contentInset?: number;
};

/** S12-02b space filters, rendered with the V2 ChipRow (selected = lilac). */
export function FeedChipRow({ chips, selectedId, onSelect, contentInset = 0 }: FeedChipRowProps) {
  const items = React.useMemo(() => chips.map(chip => ({ key: chip.id, label: chip.label })), [chips]);
  if (chips.length === 0) {
    return null;
  }
  return (
    <ChipRow
      testID="feed-chip-row"
      items={items}
      selectedKey={selectedId}
      onSelect={onSelect}
      contentInset={contentInset}
    />
  );
}
