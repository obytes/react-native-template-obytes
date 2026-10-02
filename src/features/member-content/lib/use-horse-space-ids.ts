import type { FeedChipsResult } from '@/features/member-content/types';

import { QueryClientContext } from '@tanstack/react-query';
import * as React from 'react';

import { horseSpaceIds } from '@/features/member-content/lib/space-tag';
import { MEMBER_CONTENT_QUERY_ROOT } from '@/features/member-content/types';

const EMPTY: ReadonlySet<string> = new Set();

/**
 * Horse space ids from the cached S12-02b feed chips. Read-only and
 * provider-optional: without a query client or cached chips it is empty and
 * the badge falls back to name heuristics.
 */
export function useHorseSpaceIds(): ReadonlySet<string> {
  const client = React.use(QueryClientContext);
  const read = React.useCallback((): FeedChipsResult | undefined => {
    const entry = client?.getQueriesData<FeedChipsResult>({ queryKey: [MEMBER_CONTENT_QUERY_ROOT, 'chips'] })[0];
    return entry?.[1];
  }, [client]);
  const subscribe = React.useCallback(
    (onChange: () => void) => client?.getQueryCache().subscribe(onChange) ?? (() => {}),
    [client],
  );
  const chips = React.useSyncExternalStore(subscribe, read, read);
  return React.useMemo(() => (chips ? horseSpaceIds(chips.chips) : EMPTY), [chips]);
}
