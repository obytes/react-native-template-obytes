// Shared root for horse-related query keys (list ['horses', clubId], detail
// ['horses', horseId], following ['horses', 'following', clubId]) so cache
// helpers can target them all with a single partial-match queryKey.
export const STABLES_QUERY_ROOT = 'horses';

export type HorseStatus
  = | 'PRE_TRAINING'
    | 'IN_TRAINING'
    | 'REHAB'
    | 'RETIRED'
    | 'SOLD';

export type EntryStatus
  = | 'ENTERED'
    | 'DECLARED'
    | 'NON_RUNNER'
    | 'RAN'
    | 'DISQUALIFIED'
    | 'VOID';

export type HorsePhoto = {
  url: string;
  caption?: string;
};

export type HorsePedigree = {
  sire?: string;
  dam?: string;
  damsire?: string;
};

export type Trainer = {
  id: string;
  name: string;
  // S13-10 (not yet shipped): "Kildare". Rendered only when present.
  location?: string | null;
};

export type Jockey = {
  id: string;
  name: string;
};

export type Course = {
  id: string;
  name: string;
  country: string | null;
};

export type Meeting = {
  id: string;
  date: string;
  course: Course;
};

export type Race = {
  id: string;
  name: string | null;
  postTime: string;
  raceType: string | null;
  distanceFurlongs: number | null;
  className: string | null;
  goingDescription: string | null;
  meeting: Meeting;
};

export type Entry = {
  id: string;
  status: EntryStatus;
  draw: number | null;
  weightLbs: number | null;
  finishingPosition: number | null;
  beatenLengths: string | null;
  ratingAchieved: number | null;
  timeformComment: string | null;
  performanceRating: number | null;
  starRating: number | null;
  // Admin-set link to race footage (S8-01 §5/§6). Backend field has no
  // select-narrowing so it's already on every entry response, but may be
  // absent/undefined on older cached payloads -- treat as optional.
  replayUrl?: string | null;
  // S13-10 (not yet shipped): runner count and starting price ("6/1",
  // "Evs", "11/4F"). Rendered only when present.
  fieldSize?: number | null;
  startingPrice?: string | null;
  createdAt: string;
  updatedAt: string;
  jockey: Jockey | null;
  race: Race;
};

export type HorseUpdateType = 'trainer' | 'wellbeing' | 'general' | 'race';

/**
 * GET /horses/{horseId}/updates -- the horse profile timeline, sourced from
 * the "Horse updates" (MemberPost) feature (the parallel wellbeing system
 * it replaces has been deleted backend-side). Newest first, published only.
 */
export type HorseUpdate = {
  id: string;
  updateType: HorseUpdateType | null;
  title: string;
  bodyText: string;
  publishedAt: string;
  circlePostId: string | null;
};

export type Horse = {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  status: HorseStatus;
  isFollowing: boolean;
  // Invite-only horses are only ever present in a payload when the caller
  // has access (Task 5, backend) -- this flag just says "flag it as
  // private" for chip + unfollow-confirm UI, never a client-side gate.
  inviteOnly: boolean;
  bio: string | null;
  // Long-form "Story & pedigree" narrative -- deliberately separate from
  // `bio` on the backend. Optional here too: older cached payloads (or a
  // backend that hasn't deployed the S8-01 §5 migration yet) won't have it.
  story?: string | null;
  trainerNotes: string | null;
  photos: HorsePhoto[];
  pedigree: HorsePedigree | null;
  ownershipBlurb: string | null;
  circleSpaceId: string | null;
  trainerId: string | null;
  trainer: Trainer | null;
  sortOrder: number;
  publishedAt: string;
  // Second visibility gate (public marketing site), separate from
  // `publishedAt` (in-app visibility). Not currently used by the mobile
  // app but included so the type matches the backend response.
  publicProfileAt?: string | null;
  latestEntryId: string | null;
  nextEntryId: string | null;
  providerEntityId: string | null;
  providerLastSync: string | null;
  createdAt: string;
  updatedAt: string;
  // --- S13-10 horse facts (not yet shipped). Every one is optional and the
  // UI renders it only when present, so the fields light up without a
  // mobile release. `profileLine` is server-derived ("Bay filly, 3 years
  // old") and wins over the client-side composition from the parts.
  profileLine?: string | null;
  colour?: string | null;
  sex?: HorseSex | null;
  ageYears?: number | null;
  foaledOn?: string | null;
  foaledPlace?: string | null;
  // GET /api/horses carries recent results only (RAN, max 3) plus the scalar
  // `nextEntryId`; no next-entry status or date. If a declared entry ever
  // appears here the card shows "Declared · date", else `nextEntryId` drives a
  // neutral "Entry upcoming" pill.
  entries?: Entry[];
};

export type HorseSex = 'FILLY' | 'COLT' | 'MARE' | 'GELDING' | 'STALLION';

export type HorseDetail = {
  entries: Entry[];
} & Horse;
