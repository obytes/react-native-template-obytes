import type { ImageProps } from 'expo-image';
import { Image as NImage } from 'expo-image';
import * as React from 'react';
import { withUniwind } from 'uniwind';

export type ImgProps = ImageProps & {
  className?: string;
};

withUniwind(NImage);

export const Image = ({
  style,
  className,
  placeholder = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  ...props
}: ImgProps) => {
  return (
    <NImage
      className={className}
      placeholder={placeholder}
      style={style}
      {...props}
    />
  );
};

export const preloadImages = (sources: string[]) => {
  NImage.prefetch(sources);
};
