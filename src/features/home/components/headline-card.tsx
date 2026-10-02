import type { Href } from 'expo-router';

import type { Headline } from '@/features/home/lib/select-headline';

import { useRouter } from 'expo-router';
import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';

export function HeadlineCard({ headline }: { headline: Headline }) {
  const router = useRouter();
  const cta = headline.cta;

  return (
    <View testID="headline-card" className="overflow-hidden rounded-2xl bg-primary p-6">
      <Text className="font-mono text-[10px] tracking-widest text-on-primary/70 uppercase">
        {headline.eyebrow}
      </Text>
      <Text className="mt-2 font-display text-2xl text-on-primary">{headline.title}</Text>
      {headline.subtitle
        ? (
            <Text className="mt-2 font-sans text-sm/5 text-on-primary/80">
              {headline.subtitle}
            </Text>
          )
        : null}
      {cta
        ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cta.label}
              onPress={() => router.push(cta.href as Href)}
              className="mt-4 self-start rounded-full bg-on-primary px-5 py-2.5"
            >
              <Text className="font-sans text-sm font-semibold text-primary">
                {cta.label}
              </Text>
            </Pressable>
          )
        : null}
    </View>
  );
}
