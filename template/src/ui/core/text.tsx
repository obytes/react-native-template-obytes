// In Text.tsx
import { styled } from 'nativewind';
import React from 'react';
import type { TextProps } from 'react-native';
import { StyleSheet, Text as NNText } from 'react-native';

import type { TxKeyPath } from '@/core';
import { isRTL, translate } from '@/core';

const SText = styled(NNText);

interface Props extends TextProps {
  variant?: keyof typeof textVariants;
  className?: string;
  tx?: TxKeyPath;
}

export const textVariants = {
  defaults: 'text-base text-black  dark:text-white font-inter  font-normal',
  h1: 'text-[32px] leading-[48px] font-medium',
  h2: 'text-[28px] leading-[42px] font-medium',
  h3: 'text-[24px] leading-[36px] font-medium',
  xl: 'text-[20px] leading-[30px]',
  lg: 'text-[18px] leading-[30px]',
  md: 'text-[16px] leading-[32px]',
  sm: 'text-[14px] leading-[21px]',
  xs: 'text-[12px] leading-[18px]',
  error: ' text-[12px] leading-[30px] text-danger-500',
};

export const Text = ({
  variant = 'md',
  className = '',
  style,
  tx,
  children,
  ...props
}: Props) => {
  const content = tx ? translate(tx) : children;
  return (
    <SText
      className={`

      ${textVariants.defaults}
      ${textVariants[variant]}
      ${className}
    `}
      style={StyleSheet.flatten([
        { writingDirection: isRTL ? 'rtl' : 'ltr' },
        style,
      ])}
      {...props}
    >
      {content}
    </SText>
  );
};
