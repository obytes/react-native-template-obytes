import type { TextStyle } from 'react-native';

/**
 * Design V2 type ramp (S13-01 §3, D40 decision 5). Normalised sizes, not
 * pixel-literal: floors are mono 10 / body 12.
 *
 * Families stay on the theme tokens: `font-display` = PPEiko (loaded as the
 * Medium cut, so display styles set no weight; a synthetic weight would make
 * Android fall back), `font-sans` = Plus Jakarta Sans, `font-mono` = IBM Plex
 * Mono. Tracking is in em and converted to RN points per size.
 */
export type TextVariant
  = | 'display-xl'
    | 'display-lg'
    | 'display-md'
    | 'display-sm'
    | 'title'
    | 'body-lg'
    | 'body'
    | 'body-sm'
    | 'label'
    | 'label-sm';

type VariantSpec = {
  /** Family / weight / case / default colour as Uniwind classes. */
  className: string;
  fontSize: number;
  lineHeight: number;
  /** Letter spacing in em (−0.01 = −1%). */
  tracking: number;
  /** Dynamic Type cap. */
  maxFontSizeMultiplier: number;
};

/** Default Dynamic Type cap for body/label text. Display styles use 1.2. */
export const DEFAULT_MAX_FONT_SIZE_MULTIPLIER = 1.3;
const DISPLAY_MAX_FONT_SIZE_MULTIPLIER = 1.2;
const DISPLAY_DESCENDER_RATIO = 0.15;

function display(size: number, lineHeight: number): VariantSpec {
  return {
    className: 'font-display text-ink',
    fontSize: size,
    lineHeight,
    tracking: -0.01,
    maxFontSizeMultiplier: DISPLAY_MAX_FONT_SIZE_MULTIPLIER,
  };
}

function sans(size: number, lineHeight: number, className = 'font-sans font-normal text-ink'): VariantSpec {
  return { className, fontSize: size, lineHeight, tracking: -0.01, maxFontSizeMultiplier: DEFAULT_MAX_FONT_SIZE_MULTIPLIER };
}

function mono(size: number, lineHeight: number): VariantSpec {
  return {
    className: 'font-mono font-normal text-label uppercase',
    fontSize: size,
    lineHeight,
    tracking: 0.04,
    maxFontSizeMultiplier: DEFAULT_MAX_FONT_SIZE_MULTIPLIER,
  };
}

export const TEXT_VARIANTS: Record<TextVariant, VariantSpec> = {
  'display-xl': display(44, 44),
  'display-lg': display(32, 34),
  'display-md': display(26, 28),
  'display-sm': display(21, 24),
  'title': { ...sans(16, 20, 'font-sans-semibold text-ink'), tracking: 0 },
  'body-lg': sans(15, 22),
  'body': sans(14, 20),
  'body-sm': sans(12, 16),
  'label': mono(12, 14),
  'label-sm': mono(10, 12),
};

/** Size, line height and letter spacing (in points) for a variant. */
export function textVariantStyle(variant: TextVariant): TextStyle {
  const { fontSize, lineHeight, tracking } = TEXT_VARIANTS[variant];
  const style: TextStyle = {
    fontSize,
    lineHeight,
    letterSpacing: Math.round(fontSize * tracking * 100) / 100,
  };
  // PP Eiko's descenders (g, y, p) hang below the design's tight display
  // leading, and iOS clips the last line to its line box. Bottom padding keeps
  // the glyphs visible without loosening the headline leading.
  if (variant.startsWith('display-'))
    style.paddingBottom = Math.ceil(fontSize * DISPLAY_DESCENDER_RATIO);
  return style;
}
