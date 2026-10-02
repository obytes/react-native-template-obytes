import type { ViewStyle } from 'react-native';

import colors from './colors';

/**
 * Design V2 gradients (S13-01 §2), rendered with RN 0.81 New-Arch CSS
 * gradients (`experimental_backgroundImage`). No native dependency, so they
 * ship over the air. Call sites pick a `variant`; they never hold gradient
 * strings.
 *
 * - `page` / `page-ice`: in-app page backgrounds. Render them through
 *   `<ScreenBackground>` as a fixed layer behind the scroll view, so the
 *   gradient doesn't stretch with content length.
 * - `welcome-light` / `welcome-navy`: splash, welcome loader and login.
 * - `card-plum-glow` / `card-sage-glow`: radial overlays that sit on top of a
 *   card's pattern fill. They are transparent at the edges and carry no base
 *   colour; the card itself provides `bg-plum` / `bg-sage`.
 * - `photo-scrim`: navy scrim over full-bleed photo cards so white text stays
 *   legible on real photos (not in the Figma file; S13-01 §7 Card `photo`).
 */
export type GradientVariant
  = | 'page'
    | 'page-ice'
    | 'welcome-light'
    | 'welcome-navy'
    | 'card-plum-glow'
    | 'card-sage-glow'
    | 'photo-scrim';

/** `#rrggbb` + alpha (0–1) → `#rrggbbaa`, which RN's colour parser accepts. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${a}`;
}

type GradientSpec = {
  backgroundColor?: string;
  backgroundImage: string;
};

export const GRADIENTS: Record<GradientVariant, GradientSpec> = {
  'page': {
    backgroundColor: colors.surface,
    backgroundImage: `linear-gradient(to bottom, ${colors.secondaryContainer} 0%, ${withAlpha(colors.onPrimaryContainer, 0.1)} 100%)`,
  },
  'page-ice': {
    backgroundColor: colors.surface,
    backgroundImage: `linear-gradient(to bottom, ${colors.secondaryContainer} 0%, ${withAlpha(colors.ice, 0.15)} 100%)`,
  },
  'welcome-light': {
    backgroundColor: colors.white,
    backgroundImage: `linear-gradient(to bottom, ${colors.white} 0%, ${colors.onPrimaryContainer} 100%)`,
  },
  'welcome-navy': {
    backgroundColor: colors.primary,
    backgroundImage: `linear-gradient(to bottom, ${colors.navyDeep} 0%, ${colors.primary} 60%, ${colors.primaryContainer} 100%)`,
  },
  'card-plum-glow': {
    backgroundImage: `radial-gradient(ellipse farthest-side at center, ${colors.plumMid} 0%, ${withAlpha(colors.plumMid, 0.9)} 49%, ${withAlpha(colors.plumMid, 0)} 100%)`,
  },
  'card-sage-glow': {
    backgroundImage: `radial-gradient(ellipse farthest-side at center, ${colors.sage} 0%, ${withAlpha(colors.sage, 0.9)} 49%, ${withAlpha(colors.sage, 0.75)} 82%, ${withAlpha(colors.sage, 0)} 100%)`,
  },
  'photo-scrim': {
    backgroundImage: `linear-gradient(to bottom, ${withAlpha(colors.navyDeep, 0.35)} 0%, ${withAlpha(colors.navyDeep, 0.05)} 40%, ${withAlpha(colors.navyDeep, 0.85)} 100%)`,
  },
};

/** The style object for a variant. Exported for tests (jest can't paint gradients). */
export function gradientStyle(variant: GradientVariant): ViewStyle {
  const { backgroundColor, backgroundImage } = GRADIENTS[variant];
  return {
    ...(backgroundColor ? { backgroundColor } : null),
    experimental_backgroundImage: backgroundImage,
  };
}
