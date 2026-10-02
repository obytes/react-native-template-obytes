import type { TextProps } from 'react-native';
import * as React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Text } from './text';

export type MonoLabelProps = Omit<TextProps, 'children'> & {
  children: React.ReactNode;
  /** `label-sm` (section labels, default) or `label` (large labels, "SHOP"). */
  size?: 'sm' | 'md';
  /** `light` = label navy on light surfaces; `dark` = lilac on navy/plum; `white` on photos. */
  tone?: 'light' | 'dark' | 'white';
  className?: string;
};

const TONE = {
  light: 'text-label',
  dark: 'text-on-primary-container',
  white: 'text-white',
} as const;

/** Uppercase IBM Plex Mono label (S13-01 §7): "TODAY AT THE YARD", "MY HORSES". */
export function MonoLabel({ children, size = 'sm', tone = 'light', className, ...props }: MonoLabelProps) {
  return (
    <Text
      variant={size === 'sm' ? 'label-sm' : 'label'}
      className={twMerge(TONE[tone], className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export type TagProps = {
  label: string;
  /**
   * `forest`: Figma "Labels Mono" (forest fill, white mono, r5).
   * `ice`: the ice-light "NEW" box on photos.
   * `ice-outline`: ice 1pt outline ("4 min watch").
   * `navy`: navy pill with white sans ("Active" status).
   */
  variant?: 'forest' | 'ice' | 'ice-outline' | 'navy';
  className?: string;
  testID?: string;
};

const TAG = {
  'forest': { box: 'rounded-[5px] bg-forest px-2.5 py-1.5', text: 'text-white' },
  'ice': { box: 'rounded bg-ice-light px-2 py-1.5', text: 'text-ink' },
  'ice-outline': { box: 'rounded border border-ice px-2 py-1.5', text: 'text-white' },
  'navy': { box: 'rounded-md bg-primary px-3 py-1.5', text: 'text-on-primary' },
} as const;

/** Small status/category tag. */
export function Tag({ label, variant = 'forest', className, testID }: TagProps) {
  const t = TAG[variant];
  const mono = variant === 'forest';
  return (
    <View testID={testID} className={twMerge('self-start', t.box, className)}>
      <Text
        variant={mono ? 'label-sm' : 'body-sm'}
        className={twMerge(t.text, !mono && 'font-medium')}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
