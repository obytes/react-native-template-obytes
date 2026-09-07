import type { FeedChip, MemberContentScope } from '@/features/member-content/types';

import * as React from 'react';

import { getItem, setItem } from '@/lib/storage';

const DEFAULT_CHIP_ID = 'all';

function storageKey(scope: MemberContentScope) {
  return `community-feed:chip:${scope.memberId}`;
}

export function useFeedChipSelection(scope: MemberContentScope, chips: FeedChip[]) {
  const [storedId, setStoredId] = React.useState<string>(
    () => getItem<string>(storageKey(scope)) ?? DEFAULT_CHIP_ID,
  );

  // Fall back to "all" once chips are loaded and the stored id isn't among them,
  // without mutating state in an effect — this stays a pure derivation.
  const selectedId = chips.length === 0 || chips.some(chip => chip.id === storedId)
    ? storedId
    : DEFAULT_CHIP_ID;

  const select = React.useCallback((id: string) => {
    setStoredId(id);
    void setItem(storageKey(scope), id);
  }, [scope]);

  const selectedChip = chips.find(chip => chip.id === selectedId);

  return { selectedId, select, selectedChip };
}
