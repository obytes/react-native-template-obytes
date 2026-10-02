import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { ScreenBackground, ScreenHeader, Text } from '@/components/ui';

import { ButtonSection, ChipSection, FormFieldSection, IconButtonSection } from './control-sections';
import {
  AvatarSection,
  CardSection,
  HeaderSection,
  LabelSection,
  ListRowSection,
  ProgressSection,
  StateSection,
} from './display-sections';
import { GradientSection, IconSection, LogoSection, PatternSection, TypeSection } from './foundations-sections';
import { TabBarSection } from './tab-bar-section';

const CONTENT = { gap: 32, paddingHorizontal: 16, paddingBottom: 96 };

/**
 * Design V2 dev gallery (S13-01 "Done when"): every primitive variant,
 * gradient, pattern kind × colourway, logo, V2 icon and the type ramp.
 * Reached only through the __DEV__-guarded `/dev/gallery` route.
 */
export function GalleryScreen() {
  return (
    <View className="flex-1">
      <ScreenBackground />
      <ScrollView contentContainerStyle={CONTENT} keyboardShouldPersistTaps="handled">
        <ScreenHeader variant="tab-root" title="Design V2 gallery" className="px-0" />
        <Text variant="body" className="-mt-6">Dev-only. S13-01 foundations.</Text>
        <TypeSection />
        <ButtonSection />
        <IconButtonSection />
        <ChipSection />
        <CardSection />
        <LabelSection />
        <ListRowSection />
        <HeaderSection />
        <ProgressSection />
        <FormFieldSection />
        <AvatarSection />
        <StateSection />
        <TabBarSection />
        <GradientSection />
        <PatternSection />
        <LogoSection />
        <IconSection />
      </ScrollView>
    </View>
  );
}
