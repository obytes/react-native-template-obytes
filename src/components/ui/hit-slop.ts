import type { Insets } from 'react-native';

/** Vertical hitSlop that grows a short button to the 44pt minimum target. */
export function minHitSlop(height: number): Insets | undefined {
  if (height >= 44)
    return undefined;
  const pad = Math.ceil((44 - height) / 2);
  return { top: pad, bottom: pad };
}
