import { styled } from 'nativewind';
import * as React from 'react';
import type { FastImageProps, Source } from 'react-native-fast-image';
import FastImage from 'react-native-fast-image';

const SFastImage = styled(FastImage);
export type ImgProps = FastImageProps & {
  className?: string;
};

export const Image = ({ source, style, className, ...props }: ImgProps) => {
  return (
    <SFastImage
      source={
        Object.prototype.hasOwnProperty.call(source, 'uri')
          ? { ...(source as Source), cache: FastImage.cacheControl.immutable }
          : source
      }
      className={className}
      style={style}
      {...props}
    />
  );
};

export const preloadImages = (sources: string[]) => {
  FastImage.preload(sources.map((source) => ({ uri: source })));
};
