import React from 'react';

import { Button, View } from '@/ui';

import { Title } from './title';

export const ButtonVariants = () => {
  return (
    <>
      <Title text="Buttons" />
      <View>
        <Button label="Button" />
        <Button label="Button" variant="secondary" />
        <Button label="Button" variant="outline" />
        <Button label="Button" variant="destructive" />
        <Button label="Button" variant="ghost" />
        <Button label="Button" loading={true} />
        <Button label="Button" loading={true} variant="outline" />
        <Button label="PRIMARY BUTTON DISABLED" disabled />
        <Button
          label="SECONDARY BUTTON DISABLED"
          disabled
          variant="secondary"
        />
      </View>
    </>
  );
};
