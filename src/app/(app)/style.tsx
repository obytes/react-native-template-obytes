import * as React from 'react';

import { Buttons } from '@/components/buttons';
import { Typography } from '@/components/typography';
import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/ui';

export default function Style() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <SafeAreaView className="flex-1 px-4">
          <Typography />
          {/* <ColorVariants />
          <InputVariants /> */}
          <Buttons />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
