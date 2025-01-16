/* eslint-disable max-lines-per-function */
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';

import { useUser } from '@/api/auth/use-user';
import { useAuth } from '@/components/providers/auth';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import { translate } from '@/core';
import { Env } from '@/core/env';
import { colors, FocusAwareStatusBar, ScrollView, Text, View } from '@/ui';
import { Website } from '@/ui/icons';

export default function Settings() {
  const { data: userData } = useUser();
  const { logout } = useAuth();
  const { colorScheme } = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 gap-2 p-4">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>
          <ItemsContainer title="settings.account.title">
            <Item text={'settings.account.name'} value={userData?.name ?? ''} />
            <Item
              text={'settings.account.email'}
              value={userData?.email ?? ''}
            />
          </ItemsContainer>
          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.links">
            <Link
              asChild
              href={{
                pathname: '/www',
                params: {
                  url: Env.TERMS_OF_SERVICE_URL,
                  title: translate('settings.terms'),
                },
              }}
            >
              <Item text="settings.terms" />
            </Link>
            <Link
              asChild
              href={{
                pathname: '/www',
                params: {
                  url: Env.WEBSITE_URL,
                  title: translate('settings.website'),
                },
              }}
            >
              <Item
                text="settings.website"
                icon={<Website color={iconColor} />}
              />
            </Link>
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" onPress={logout} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
