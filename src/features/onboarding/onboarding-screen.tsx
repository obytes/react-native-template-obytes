import { useRouter } from 'expo-router';
import * as React from 'react';

import { Submark } from '@/components/brand/logo';
import {
  Button,
  colors,
  Dots,
  FocusAwareStatusBar,
  SafeAreaView,
  ScreenBackground,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';

const BULLETS = [
  '🚀 Production-ready',
  '🥷 Developer experience + Productivity',
  '🧩 Minimal code and dependencies',
  '💪 well maintained third-party libraries',
];

const SLIDE_COUNT = 2;

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const isLast = index === SLIDE_COUNT - 1;

  return (
    <View className="flex-1">
      <FocusAwareStatusBar />
      <ScreenBackground variant="welcome-light" />
      <SafeAreaView className="flex-1 px-8 pb-6">
        <View className="flex-1 justify-center">
          <Submark width={52} color={colors.ink} />
          {index === 0
            ? (
                <View testID="onboarding-slide-0">
                  <Text variant="display-lg" className="mt-6">Obytes Starter</Text>
                  <Text variant="body" className="mt-3 text-ink-variant">
                    The right way to build your mobile app
                  </Text>
                </View>
              )
            : (
                <View testID="onboarding-slide-1" className="mt-6 gap-3">
                  {BULLETS.map(line => (
                    <Text key={line} variant="body-lg">{line}</Text>
                  ))}
                </View>
              )}
        </View>
        <Dots count={SLIDE_COUNT} index={index} className="mb-6 self-center" testID="onboarding-dots" />
        <Button
          testID="onboarding-cta"
          label={isLast ? 'Let\'s Get Started' : 'Next'}
          onPress={() => {
            if (!isLast) {
              setIndex(index + 1);
              return;
            }
            setIsFirstTime(false);
            router.replace('/login');
          }}
        />
      </SafeAreaView>
    </View>
  );
}
