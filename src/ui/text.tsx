import React from 'react';
import type { TextProps, TextStyle } from 'react-native';
import { I18nManager, StyleSheet, Text as NNText } from 'react-native';
import { twMerge } from 'tailwind-merge';

import type { TxKeyPath } from '@/core/i18n';
import { translate } from '@/core/i18n';

interface Props extends TextProps {
  className?: string;
  tx?: TxKeyPath | { key: TxKeyPath; params: { [key: string]: any } };
}

export const Text = ({
  className = '',
  style,
  tx,
  children,
  ...props
}: Props) => {
  const textStyle = React.useMemo(
    () =>
      twMerge(
        'text-base text-black  dark:text-white  font-inter font-normal',
        className,
      ),
    [className],
  );

  const nStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        {
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]) as TextStyle,
    [style],
  );
  return (
    <NNText className={textStyle} style={nStyle} {...props}>
      {tx
        ? typeof tx === 'string'
          ? translate(tx)
          : translate(tx.key, tx.params)
        : children}
    </NNText>
  );
};
