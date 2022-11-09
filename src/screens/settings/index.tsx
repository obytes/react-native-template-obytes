import Config from '@config';
import * as React from 'react';

import { useAuth } from '@/core';
import { translate } from '@/core';
import { ScrollView, Text, View } from '@/ui';
import { Github, Rate, Share, Support, Website } from '@/ui/icons';

import { Item } from './item';
import { ItemsContainer } from './items-container';
import { LanguageItem } from './language-item';
import { ThemeItem } from './theme-item';

export const Settings = () => {
  const { signOut } = useAuth();
  return (
    <ScrollView className="bg-white">
      <View className="flex-1 px-4 pt-16">
        <Text variant="lg" className="font-bold">
          {translate('settings.title')}
        </Text>
        <ItemsContainer title="settings.generale">
          <LanguageItem />
          <ThemeItem />
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
