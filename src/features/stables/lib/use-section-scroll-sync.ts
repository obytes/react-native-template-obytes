import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';
import type { HorseSectionKey } from '@/features/stables/lib/horse-sections';

import * as React from 'react';

import { getActiveSection, getSectionScrollTarget } from '@/features/stables/lib/horse-sections';

/** A section is "active" once its top crosses this fraction of the viewport. */
const ACTIVE_LINE_FRACTION = 0.3;
/** How long scroll tracking pauses after a chip tap, so the animated scroll doesn't flick the chip through the sections in between. */
const TAP_LOCK_MS = 600;
const END_TOLERANCE = 4;

/**
 * Section-chip ↔ scroll sync for Horse detail (S13-04 §2). Sections must be
 * direct children of the ScrollView's content so their `onLayout` y is a
 * content offset. No new dependencies: plain onScroll + measured offsets.
 */
export function useSectionScrollSync(visible: readonly HorseSectionKey[]) {
  const scrollRef = React.useRef<ScrollView>(null);
  const offsetsRef = React.useRef<Partial<Record<HorseSectionKey, number>>>({});
  const lockRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = React.useState<HorseSectionKey | undefined>(undefined);

  React.useEffect(() => () => {
    if (lockRef.current)
      clearTimeout(lockRef.current);
  }, []);

  const onSectionLayout = React.useCallback(
    (key: HorseSectionKey) => (event: LayoutChangeEvent) => {
      offsetsRef.current[key] = event.nativeEvent.layout.y;
    },
    [],
  );

  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (lockRef.current)
        return;
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const offsets = visible.flatMap((key) => {
        const y = offsetsRef.current[key];
        return y == null ? [] : [{ key, y }];
      });
      const atEnd = contentSize.height > layoutMeasurement.height
        && contentOffset.y + layoutMeasurement.height >= contentSize.height - END_TOLERANCE;
      const next = getActiveSection(offsets, contentOffset.y, {
        threshold: layoutMeasurement.height * ACTIVE_LINE_FRACTION,
        atEnd,
      });
      if (next)
        setActive(prev => (prev === next ? prev : next));
    },
    [visible],
  );

  const scrollToSection = React.useCallback((key: HorseSectionKey) => {
    const y = offsetsRef.current[key];
    setActive(key);
    if (y == null)
      return;
    if (lockRef.current)
      clearTimeout(lockRef.current);
    lockRef.current = setTimeout(() => {
      lockRef.current = null;
    }, TAP_LOCK_MS);
    scrollRef.current?.scrollTo({ y: getSectionScrollTarget(y), animated: true });
  }, []);

  /** Scroll to an arbitrary content offset (e.g. a single update card). */
  const scrollToOffset = React.useCallback((y: number) => {
    scrollRef.current?.scrollTo({ y: getSectionScrollTarget(y), animated: true });
  }, []);

  const selected = active && visible.includes(active) ? active : visible[0];

  return { scrollRef, onSectionLayout, onScroll, scrollToSection, scrollToOffset, offsetsRef, selected };
}
