import { Env } from '@env';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import { translate, useAuth } from '@/core';
import { colors, FocusAwareStatusBar, ScrollView, Text, View } from '@/ui';
import { Website } from '@/ui/icons';

export default function Settings() {
  const signOut = useAuth.use.signOut();
  const { colorScheme } = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  return (
    <>
      <FocusAwareStatusBar />

      <ScrollView>
        <View className="flex-1 px-4 pt-16 ">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>
          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.links">
            <Item
              text="settings.terms"
              onPress={() => {
                const url = encodeURIComponent(Env.TERMS_AND_CONDITIONS_URL);
                const title = encodeURIComponent('Terms & Conditions');

                router.push(`/www?url=${url}&title=${title}`);
              }}
            />
            <Item
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => {
                const url = encodeURIComponent(Env.WEBSITE_URL);
                const title = encodeURIComponent('Website');

                router.push(`/www?url=${url}&title=${title}`);
              }}
            />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" onPress={signOut} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
