// In Text.tsx
import { styled } from 'nativewind';
import React from 'react';
import type { TextProps } from 'react-native';
import { Text as NNText } from 'react-native';

const SText = styled(NNText);
const variantStyles = {
  defaults: 'text-base text-black',
  body: 'text-base text-grey-200',
  header: 'text-xl font-bold ',
  subheader: 'bg-white-500 ',
  label: 'text-xs text-grey-500',
  error: 'text-xs text-red-500',
};

interface Props extends TextProps {
  variant?: keyof typeof variantStyles;
  className?: string;
}

export const Text = ({ variant = 'body', className = '', ...props }: Props) => {
  return (
    <SText
      className={`
      ${variantStyles.defaults}
      ${variantStyles[variant]}
      ${className}
    `}
      {...props}
    />
  );
};
