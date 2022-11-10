import React from 'react';

import { Button, buttonVariants, View } from '@/ui';

import { Title } from './title';

type variant = keyof typeof buttonVariants;

export const ButtonVariants = () => {
  return (
    <>
      <Title text="Buttons" />
      <View>
        {(Object.keys(buttonVariants) as variant[])
          .filter((v) => v !== 'defaults')
          .map((variant, index) => {
            return (
              <Button
                key={`button-${index}`}
                label={`${variant.toUpperCase()} BUTTON`}
                variant={variant}
              />
            );
          })}
        <Button label="Button" loading={true} variant="primary" />
        <Button label="Button" loading={true} variant="outline" />
        <Button label="PRIMARY BUTTON DISABLED" disabled variant="primary" />
        <Button
          label="SECONDARY BUTTON DISABLED"
          disabled
          variant="secondary"
        />
      </View>
    </>
  );
};
