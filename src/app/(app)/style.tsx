import * as React from 'react';

import { ButtonVariants } from '@/components/button-variants';
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
          <ButtonVariants />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
