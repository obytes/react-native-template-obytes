import { useRouter } from 'expo-router';

import { Cover } from '@/components/cover';
import { translate } from '@/core';
import { useIsFirstTime } from '@/core/hooks';
import { Button, FocusAwareStatusBar, SafeAreaView, Text, View } from '@/ui';

export default function Onboarding() {
  const [, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();

  return (
    <View className="flex h-full items-center justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="justify-end">
        <Text className="my-3 text-center text-5xl font-bold">
          {translate('onboarding.title')}
        </Text>
        <Text className="mb-2 text-center text-lg text-gray-600">
          {translate('onboarding.subtitle')}
        </Text>

        <Text className="my-1 pt-6 text-left text-lg">
          {translate('onboarding.features.production_ready')}
        </Text>
        <Text className="my-1 text-left text-lg">
          {translate('onboarding.features.developer_experience')}
        </Text>
        <Text className="my-1 text-left text-lg">
          {translate('onboarding.features.minimal_code')}
        </Text>
        <Text className="my-1 text-left text-lg">
          {translate('onboarding.features.well_maintained_libraries')}
        </Text>
      </View>
      <SafeAreaView className="mt-6">
        <Button
          label={translate('onboarding.button_label')}
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/sign-in');
          }}
        />
      </SafeAreaView>
    </View>
  );
}
