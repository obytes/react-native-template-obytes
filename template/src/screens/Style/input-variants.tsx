import React from 'react';

import { Input, SelectInput, View } from '@/ui';

import { Title } from './title';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

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
        <Input label="Focused" />
        <SelectInput label="Focused" options={options} />
      </View>
    </>
  );
};
