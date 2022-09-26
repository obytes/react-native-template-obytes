import React from 'react';

import { Text, View } from '@/ui';
import colors from '@/ui/theme/colors';

import { Title } from './title';
type ColorName = keyof typeof colors;

export const ColorVariants = () => {
  return (
    <>
      <Title text="Colors" />
      {(Object.keys(colors) as ColorName[]).map((name) => (
        <ColorVariant name={name} key={name} />
      ))}
    </>
  );
};

const ColorVariant = ({ name }: { name: ColorName }) => {
  if (typeof colors[name] === 'string') return null;
  return (
    <View className="pt-2">
      <Text variant="md" className="font-medium">
        {name.toUpperCase()}
      </Text>
      <View className=" flex-row flex-wrap content-between  justify-between  ">
        {Object.entries(colors[name]).map(([key, value]) => {
          return (
            <ColorCard
              key={`${colors[name]}-${key}`}
              value={key}
              color={value}
            />
          );
        })}
      </View>
    </View>
  );
};

const ColorCard = ({ color, value }: { value: string; color: string }) => {
  return (
    <View className="flex-[1/5] items-center justify-center py-1">
      <View
        style={{ backgroundColor: color }}
        className={`h-[42px] w-[42px] items-center justify-center rounded-full  border-[1px] border-neutral-200`}
      >
        <Text variant="sm">{value}</Text>
      </View>
      <Text variant="sm">{color}</Text>
    </View>
  );
};
