/**
 * Horse detail section chips (S13-04 §2): Story · Racing · Updates ·
 * Wellbeing. All sections render stacked; a chip scrolls to its section and
 * the selected chip follows the scroll position. A chip is hidden when its
 * section is empty.
 */
export type HorseSectionKey = 'story' | 'racing' | 'updates' | 'wellbeing';

export const HORSE_SECTION_ORDER: readonly HorseSectionKey[] = ['story', 'racing', 'updates', 'wellbeing'];

export type HorseSectionContent = {
  hasStory: boolean;
  hasPedigree: boolean;
  hasNextEntry: boolean;
  resultCount: number;
  updateCount: number;
  wellbeingCount: number;
};

export function getVisibleHorseSections(content: HorseSectionContent): HorseSectionKey[] {
  const visible: Record<HorseSectionKey, boolean> = {
    story: content.hasStory || content.hasPedigree,
    racing: content.hasNextEntry || content.resultCount > 0,
    updates: content.updateCount > 0,
    wellbeing: content.wellbeingCount > 0,
  };
  return HORSE_SECTION_ORDER.filter(key => visible[key]);
}

export type SectionOffset = { key: HorseSectionKey; y: number };

/**
 * The section that owns the current scroll position: the last section whose
 * top has crossed `scrollY + threshold`. At the very bottom of the content
 * the last section wins, since a short final section can never reach the
 * threshold line. Before the first section, the first one is selected.
 */
export function getActiveSection(
  offsets: readonly SectionOffset[],
  scrollY: number,
  { threshold = 0, atEnd = false }: { threshold?: number; atEnd?: boolean } = {},
): HorseSectionKey | undefined {
  if (offsets.length === 0)
    return undefined;
  const sorted = [...offsets].sort((a, b) => a.y - b.y);
  if (atEnd)
    return sorted[sorted.length - 1].key;
  const line = scrollY + threshold;
  let active = sorted[0].key;
  for (const offset of sorted) {
    if (offset.y <= line)
      active = offset.key;
    else
      break;
  }
  return active;
}

/** Scroll target for a section: its top, less a little breathing room, never negative. */
export function getSectionScrollTarget(offsetY: number, inset = 12): number {
  return Math.max(0, offsetY - inset);
}
