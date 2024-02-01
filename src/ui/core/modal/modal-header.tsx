import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../text';
import { XClose } from './x-close';

type ModalHeaderProps = {
  title?: string;
  dismiss: () => void;
};

export const ModalHeader = React.memo(
  ({ title, dismiss }: ModalHeaderProps) => {
    return (
      <>
        {title && (
          <View className="flex-row px-2 py-4">
            <View className="h-[24px] w-[24px]" />
            <View className="flex-1">
              <Text className="text-center text-[16px] font-bold text-[#26313D]">
                {title}
              </Text>
            </View>
          </View>
        )}
        <CloseButton close={dismiss} />
      </>
    );
  }
);

const CloseButton = ({ close }: { close: () => void }) => {
  return (
    <Pressable
      onPress={close}
      className="absolute right-3 top-3 h-[24px] w-[24px] items-center justify-center "
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      accessibilityLabel="close modal"
      accessibilityRole="button"
      accessibilityHint="closes the modal"
    >
      <XClose fill="#000" />
    </Pressable>
  );
};
