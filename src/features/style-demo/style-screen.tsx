import * as React from 'react';

import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';
import { Buttons } from './components/buttons-demo';
import { Colors } from './components/colors-demo';
import { Inputs } from './components/inputs-demo';
import { Typography } from './components/typography-demo';

export function StyleScreen() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="flex-1">
          <Typography />
          <Colors />
          <Buttons />
          <Inputs />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
