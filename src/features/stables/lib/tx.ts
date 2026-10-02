import type { TxKeyPath } from '@/lib/i18n';

import i18n from '@/lib/i18n';

/**
 * `translate` with interpolation. The shared `translate` helper is typed
 * without an options argument, so interpolated Stables strings go through
 * i18next directly (same instance, same resources).
 */
export function tx(key: TxKeyPath, options?: Record<string, string | number>): string {
  return i18n.t(key, options) as unknown as string;
}
