import React from 'react';

import { Text, textVariants, View } from '@/ui';

import { Title } from './title';

type variant = keyof typeof textVariants;

export const TextVariants = () => {
  return (
    <>
      <Title text="Typography" />
      <View>
        {(Object.keys(textVariants) as variant[])
          .filter((v) => v !== 'defaults')
          .map((variant, index) => {
            return (
              <View className="mb-4 flex-row" key={`text-${index}`}>
                <Text variant={variant} className="pr-2 font-light">
                  {variant.toUpperCase()} Text
                </Text>
                <Text variant={variant} className="pr-2 font-medium">
                  {variant.toUpperCase()} Text
                </Text>
                <Text variant={variant} className="pr-2 font-bold">
                  {variant.toUpperCase()} Text
                </Text>
              </View>
            );
          })}
      </View>
    </>
  );
};
