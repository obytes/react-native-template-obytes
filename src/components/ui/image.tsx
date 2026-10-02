/* eslint-disable react-refresh/only-export-components */
import type { ImageErrorEventData, ImageProps } from 'expo-image';
import type { PhotoFallbackProps } from './photo-fallback';
import { Image as NImage } from 'expo-image';
import * as React from 'react';
import { withUniwind } from 'uniwind';

import { PhotoFallback } from './photo-fallback';

export type ImgProps = ImageProps & {
  className?: string;
  /**
   * Design V2 fallback (S13-01 §6): when set, a missing `source` or a load
   * error renders a `PhotoFallback` (pattern in this colourway, optional
   * initials) in the image's box instead of the blurhash placeholder.
   */
  fallback?: Pick<PhotoFallbackProps, 'colourway' | 'initials' | 'kind' | 'tileSize'>;
};

const StyledImage = withUniwind(NImage);

function hasSource(source: ImageProps['source']): boolean {
  if (source == null)
    return false;
  if (typeof source === 'string')
    return source.length > 0;
  if (Array.isArray(source))
    return source.length > 0;
  if (typeof source === 'object' && 'uri' in source)
    return Boolean(source.uri);
  return true;
}

export function Image({
  style,
  className,
  placeholder = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
  fallback,
  onError,
  testID,
  ...props
}: ImgProps) {
  const [failed, setFailed] = React.useState(false);
  const handleError = React.useCallback((e: ImageErrorEventData) => {
    setFailed(true);
    onError?.(e);
  }, [onError]);

  if (fallback && (failed || !hasSource(props.source))) {
    return (
      <PhotoFallback
        {...fallback}
        testID={testID}
        className={className}
        style={style as PhotoFallbackProps['style']}
      />
    );
  }

  return (
    <StyledImage
      className={className}
      placeholder={fallback ? undefined : placeholder}
      style={style}
      testID={testID}
      onError={fallback ? handleError : onError}
      {...props}
    />
  );
}

export function preloadImages(sources: string[]) {
  NImage.prefetch(sources);
}
