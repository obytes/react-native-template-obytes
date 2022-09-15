import Config from '@config';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { useAuth, useSelectedLanguage } from '@/core';
import type { Language } from '@/core/i18n/utils';
import type { Option } from '@/ui';
import { Options, ScrollView, Text, View } from '@/ui';
import { Github, Rate, Share, Support, Website } from '@/ui/icons';

import { Item } from './item';
import { ItemsContainer } from './items-container';

type Props = {};
export const Settings = ({}: Props) => {
  const { signOut } = useAuth();
  return (
    <ScrollView className="bg-white">
      <View className="flex-1 px-4 pt-16">
        <Text variant="lg" className="font-bold">
          Settings
        </Text>
        <ItemsContainer title="UI">
          <LanguageItem />
        </ItemsContainer>

        <ItemsContainer title="Generale">
          <Item text="Share" icon={<Share />} onPress={() => {}} />
          <Item text="Rate" icon={<Rate />} onPress={() => {}} />
          <Item text="Support" icon={<Support />} onPress={() => {}} />
        </ItemsContainer>

        <ItemsContainer title="Links">
          <Item text="Github" icon={<Github />} onPress={() => {}} />
          <Item text="Website" icon={<Website />} onPress={() => {}} />
        </ItemsContainer>

        <ItemsContainer title="About">
          <Item text="App Name" value={Config.name} />
          <Item text="Version" value={Config.version} />
        </ItemsContainer>

        <ItemsContainer title="More">
          <Item text="Sign Out" onPress={signOut} />
        </ItemsContainer>
      </View>
    </ScrollView>
  );
};

const LanguageItem = () => {
  const { setLanguage } = useSelectedLanguage();
  const optionsRef = React.useRef<BottomSheetModal>(null);
  const open = React.useCallback(() => optionsRef.current?.present(), []);
  const onSelect = React.useCallback(
    (option: Option) => {
      setLanguage(option.value as Language);
      optionsRef.current?.dismiss();
    },
    [setLanguage]
  );

  const langs = React.useMemo(
    () => [
      { label: 'English', value: 'en' },
      { label: 'Arabic', value: 'ar' },
    ],
    []
  );
  return (
    <>
      <Item text="Language" value="English" onPress={open} />
      <Options ref={optionsRef} options={langs} onSelect={onSelect} />
    </>
  );
};
