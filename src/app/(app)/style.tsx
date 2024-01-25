import * as React from 'react';

import { ButtonVariants } from '@/components/button-variants';
import { ColorVariants } from '@/components/color-variants';
import { InputVariants } from '@/components/input-variants';
import { TextVariants } from '@/components/text-variants';
import { FocusAwareStatusBar, ScrollView, View } from '@/ui';

export default function Style() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1  px-4 pt-10">
          <TextVariants />
          <ColorVariants />
          <InputVariants />
          <ButtonVariants />
        </View>
      </ScrollView>
    </>
  );
}
