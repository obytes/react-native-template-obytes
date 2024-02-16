import React from 'react';

import { Text, View } from '@/ui';
import colors from '@/ui/theme/colors';

import { Title } from './title';
type ColorName = keyof typeof colors;

export const Colors = () => {
  return (
    <>
      <Title text="Colors" />
      {(Object.keys(colors) as ColorName[]).map((name) => (
        <Color name={name} key={name} />
      ))}
    </>
  );
};

const Color = ({ name }: { name: ColorName }) => {
  if (typeof colors[name] === 'string') return null;
  return (
    <View className="pt-2">
      <Text className="font-medium">{name.toUpperCase()}</Text>
      <View className="flex-row flex-wrap content-between justify-around ">
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
    <View className="items-center justify-center py-1">
      <View
        style={{ backgroundColor: color }}
        className={`h-[42px] w-[42px] items-center justify-center rounded-full  border-[1px] border-neutral-200 dark:border-charcoal-700`}
      >
        <Text className="text-sm">{value}</Text>
      </View>
      <Text className="text-sm">{color}</Text>
    </View>
  );
};
