import { Redirect, Stack } from 'expo-router';
import * as React from 'react';

import { GalleryScreen } from '@/features/dev-gallery/gallery-screen';

/**
 * Dev-only design gallery. Unreachable in release builds: `__DEV__` is false
 * there, so the route redirects home before rendering anything.
 * Open with `<scheme>://dev/gallery` (e.g. `xcrun simctl openurl booted …`).
 */
export default function DevGalleryRoute() {
  if (!__DEV__)
    return <Redirect href="/" />;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GalleryScreen />
    </>
  );
}
