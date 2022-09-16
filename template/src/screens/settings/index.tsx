import Config from '@config';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { useAuth, useSelectedLanguage } from '@/core';
import { translate } from '@/core';
import type { Language } from '@/core/i18n/types';
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
          {translate('settings.title')}
        </Text>
        <ItemsContainer title="settings.generale">
          <LanguageItem />
          <Item
            text="settings.theme"
            onPress={() => {}}
            value={translate('settings.light')}
          />
        </ItemsContainer>

        <ItemsContainer title="settings.about">
          <Item text="settings.app_name" value={Config.name} />
          <Item text="settings.version" value={Config.version} />
        </ItemsContainer>

        <ItemsContainer title="settings.support_us">
          <Item text="settings.share" icon={<Share />} onPress={() => {}} />
          <Item text="settings.rate" icon={<Rate />} onPress={() => {}} />
          <Item text="settings.support" icon={<Support />} onPress={() => {}} />
        </ItemsContainer>

        <ItemsContainer title="settings.links">
          <Item text="settings.privacy" onPress={() => {}} />
          <Item text="settings.terms" onPress={() => {}} />
          <Item text="settings.github" icon={<Github />} onPress={() => {}} />
          <Item text="settings.website" icon={<Website />} onPress={() => {}} />
        </ItemsContainer>

        <View className="my-8">
          <ItemsContainer>
            <Item text="settings.logout" onPress={signOut} />
          </ItemsContainer>
        </View>
      </View>
    </ScrollView>
  );
};

const LanguageItem = () => {
  const { language, setLanguage } = useSelectedLanguage();
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
      { label: translate('settings.english'), value: 'en' },
      { label: translate('settings.arabic'), value: 'ar' },
    ],
    []
  );

  const selectedLanguageLabel = React.useMemo(
    () => langs.find((lang) => lang.value === language)?.label,
    [language, langs]
  );

  return (
    <>
      <Item
        text="settings.language"
        value={selectedLanguageLabel}
        onPress={open}
      />
      <Options ref={optionsRef} options={langs} onSelect={onSelect} />
    </>
  );
};
