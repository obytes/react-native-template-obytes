import Config from '@config';
import * as React from 'react';

import { ScrollView, Text, View } from '@/ui';
import { Github, Rate, Share, Support, Website } from '@/ui/icons';

import { Item } from './item';
import { ItemsContainer } from './items-container';

type Props = {};
export const Settings = ({}: Props) => {
  return (
    <ScrollView className="bg-white">
      <View className="flex-1 px-4 pt-16">
        <Text variant="lg" className="font-bold">
          Settings
        </Text>
        <ItemsContainer title="UI">
          <Item text="Language" value="English" onPress={() => {}} />
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
      </View>
    </ScrollView>
  );
};
