import React from 'react';

import { Input, View } from '@/ui';

import { Title } from './title';

export const InputVariants = () => {
  return (
    <>
      <Title text="Form" />
      <View>
        <Input label="Default" placeholder="Lorem ipsum dolor sit amet" />
        <Input
          label="Error"
          error={{ message: 'Lorem ipsum dolor sit amet' }}
        />
        <Input label="Focused" autoFocus />
      </View>
    </>
  );
};
