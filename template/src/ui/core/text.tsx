// In Text.tsx
import { styled } from 'nativewind';
import React from 'react';
import type { TextProps } from 'react-native';
import { Text as NNText } from 'react-native';

const SText = styled(NNText);

export const textVariants = {
  defaults: 'text-base text-black font-inter  font-normal',
  h1: 'text-[32px] leading-[48px] font-medium',
  h2: 'text-[28px] leading-[42px] font-medium',
  h3: 'text-[24px] leading-[36px] font-medium',
  xl: 'text-[20px] leading-[30px]',
  lg: 'text-[18px] leading-[30px]',
  md: 'text-[16px] leading-[30px]',
  sm: 'text-[14px] leading-[30px]',
  xs: 'text-[12px] leading-[30px]',
  error: ' text-[12px] leading-[30px] text-danger-500',
};

interface Props extends TextProps {
  variant?: keyof typeof textVariants;
  className?: string;
}

export const Text = ({ variant = 'md', className = '', ...props }: Props) => {
  return (
    <SText
      className={`
      ${textVariants.defaults}
      ${textVariants[variant]}
      ${className}
    `}
      {...props}
    />
  );
};
