export type InboxTag = 'racing' | 'updates' | 'community' | 'club';

export type InboxTagSpec = {
  tag: InboxTag;
  label: string;
  /** Tailwind background class for the tag box. */
  boxClass: string;
};

const RACING_KINDS = new Set(['race_declared', 'race_non_runner', 'race_result']);
const UPDATE_KINDS = new Set(['horse_update', 'horse_posts']);
const COMMUNITY_KINDS = new Set(['post_like', 'post_comment', 'post_removed']);

/** Inbox `kind` (S12-06 kinds.ts) to its category tag. Unknown kinds read as CLUB. */
export function tagForKind(kind: string): InboxTag {
  if (RACING_KINDS.has(kind))
    return 'racing';
  if (UPDATE_KINDS.has(kind))
    return 'updates';
  if (COMMUNITY_KINDS.has(kind))
    return 'community';
  return 'club';
}

const SPECS: Record<InboxTag, InboxTagSpec> = {
  racing: { tag: 'racing', label: 'Racing', boxClass: 'bg-sage' },
  updates: { tag: 'updates', label: 'Updates', boxClass: 'bg-ice' },
  community: { tag: 'community', label: 'Community', boxClass: 'bg-primary-fixed' },
  club: { tag: 'club', label: 'Club', boxClass: 'bg-secondary-container' },
};

export function tagSpecForKind(kind: string): InboxTagSpec {
  return SPECS[tagForKind(kind)];
}
