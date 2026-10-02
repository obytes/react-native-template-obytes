import * as React from 'react';

import { Submark } from '@/components/brand/logo';
import { colors, FocusAwareStatusBar, ScreenBackground, Text, View } from '@/components/ui';
import { firstName } from './welcome-name';
import { WelcomeSpinner } from './welcome-spinner';

export const WELCOME_MIN_DURATION_MS = 600;

export type WelcomeLoaderProps = {
  /** Full display name; only the first token is shown. */
  name?: string | null;
  /** Called once the minimum display time has elapsed. */
  onReady?: () => void;
  minDurationMs?: number;
};

/**
 * S13-02 frame 4: shown after a successful sign-in while the app hands off to
 * Home. Always visible for at least `minDurationMs` so it never flashes.
 */
export function WelcomeLoader({ name, onReady, minDurationMs = WELCOME_MIN_DURATION_MS }: WelcomeLoaderProps) {
  const first = firstName(name);
  const onReadyRef = React.useRef(onReady);
  onReadyRef.current = onReady;

  React.useEffect(() => {
    const timer = setTimeout(() => onReadyRef.current?.(), minDurationMs);
    return () => clearTimeout(timer);
  }, [minDurationMs]);

  return (
    <View testID="welcome-loader" className="flex-1 items-center px-8 pt-[100px]">
      <FocusAwareStatusBar barStyle="dark" />
      <ScreenBackground variant="welcome-light" />
      <Submark width={52} color={colors.ink} />
      <Text variant="display-xl" testID="welcome-heading" className="mt-6 text-center">
        Welcome
        {first && (
          <Text variant="display-xl" testID="welcome-name" className="text-on-primary-container">
            {`\n${first}`}
          </Text>
        )}
      </Text>
      <View className="mt-11">
        <WelcomeSpinner />
      </View>
    </View>
  );
}
