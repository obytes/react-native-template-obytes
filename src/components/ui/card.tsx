import type { ImageSource } from 'expo-image';
import type { ViewProps } from 'react-native';
import type { FallbackColourway } from './photo-fallback';
import type { TileSpec } from '@/components/brand/pattern';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { PatternFill } from '@/components/brand/pattern';

import { Gradient } from './gradient';
import { Image } from './image';

/**
 * Design V2 card (S13-01 §7). r8, p16, no shadow.
 * - `white` (default): white on the page gradient.
 * - `navy`: navy hero/news card.
 * - `plum`: plum harlequin pattern under the plum-mid glow (charity snapshot).
 * - `sage`: sage with a radial glow (wellbeing / member vote).
 * - `photo`: full-bleed image with a navy scrim for text legibility; a
 *   missing or broken image falls back to the `fallbackColourway` pattern.
 */
export type CardVariant = 'white' | 'navy' | 'plum' | 'sage' | 'photo';

const BG: Record<CardVariant, string> = {
  white: 'bg-white',
  navy: 'bg-primary',
  plum: 'bg-plum',
  sage: 'bg-sage',
  photo: 'bg-primary',
};

const PLUM_PATTERN: TileSpec = { kind: 'harlequin', colourway: 'plum', turn: 0 };

export type CardProps = ViewProps & {
  variant?: CardVariant;
  /** `photo` only: the image. */
  image?: ImageSource | string | null;
  /** `photo` only: pattern colourway if the image is missing/fails (default cream). */
  fallbackColourway?: FallbackColourway;
  /** `plum` only: override the pattern tile (e.g. the green charity hero). */
  pattern?: TileSpec;
  /** Drop the default 16pt padding (e.g. a card whose top is a full-bleed image). */
  noPadding?: boolean;
  className?: string;
};

function CardBackdrop({ variant, image, fallbackColourway, pattern }: Pick<CardProps, 'variant' | 'image' | 'fallbackColourway' | 'pattern'>) {
  if (variant === 'plum') {
    return (
      <>
        <PatternFill spec={pattern ?? PLUM_PATTERN} borderRadius={8} style={StyleSheet.absoluteFill} />
        <Gradient variant="card-plum-glow" pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glow]} />
      </>
    );
  }
  if (variant === 'sage') {
    return <Gradient variant="card-sage-glow" pointerEvents="none" style={StyleSheet.absoluteFill} />;
  }
  if (variant === 'photo') {
    return (
      <>
        <Image
          source={image ?? null}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
          fallback={{ colourway: fallbackColourway ?? 'cream' }}
          accessibilityIgnoresInvertColors
        />
        <Gradient variant="photo-scrim" pointerEvents="none" style={StyleSheet.absoluteFill} />
      </>
    );
  }
  return null;
}

export function Card({
  variant = 'white',
  image,
  fallbackColourway,
  pattern,
  noPadding = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <View
      {...props}
      className={twMerge('overflow-hidden rounded-lg', BG[variant], !noPadding && 'p-4', className)}
    >
      <CardBackdrop variant={variant} image={image} fallbackColourway={fallbackColourway} pattern={pattern} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Figma: pattern + plum-mid @60% over the plum base.
  glow: { opacity: 0.6 },
});
