import type { TextProps, TextStyle } from 'react-native';
import type { TextVariant } from './text-variants';
import type { TxKeyPath } from '@/lib/i18n';
import * as React from 'react';
import { I18nManager, Text as NNText, StyleSheet } from 'react-native';

import { twMerge } from 'tailwind-merge';
import { translate } from '@/lib/i18n';

import {
  DEFAULT_MAX_FONT_SIZE_MULTIPLIER,
  TEXT_VARIANTS,
  textVariantStyle,
} from './text-variants';

type Props = {
  className?: string;
  tx?: TxKeyPath;
  /**
   * Design V2 type ramp. Sets family, size, line height, tracking, case and a
   * default colour; `className` still overrides (e.g. a colour on navy).
   * Without a variant the legacy default (`font-sans text-base`) applies,
   * so screens that haven't migrated yet render as before.
   */
  variant?: TextVariant;
} & TextProps;

const LEGACY_BASE = 'font-sans text-base font-normal text-ink';

export function Text({
  className = '',
  style,
  tx,
  variant,
  maxFontSizeMultiplier,
  children,
  ...props
}: Props) {
  const spec = variant ? TEXT_VARIANTS[variant] : undefined;

  const textStyle = React.useMemo(
    () => twMerge(spec ? spec.className : LEGACY_BASE, className),
    [spec, className],
  );

  const nStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        {
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        },
        variant ? textVariantStyle(variant) : null,
        style,
      ]) as TextStyle,
    [variant, style],
  );

  return (
    <NNText
      className={textStyle}
      style={nStyle}
      maxFontSizeMultiplier={
        maxFontSizeMultiplier
        ?? spec?.maxFontSizeMultiplier
        ?? DEFAULT_MAX_FONT_SIZE_MULTIPLIER
      }
      {...props}
    >
      {tx ? translate(tx) : children}
    </NNText>
  );
}
