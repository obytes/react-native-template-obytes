import React from 'react';

import type { Option } from '@/ui';
import { Input, Select, View } from '@/ui';
import { Checkbox, Radio, Switch } from '@/ui/core/checkbox';

import { Title } from './title';

const options: Option[] = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

export const Inputs = () => {
  const [value, setValue] = React.useState<string | number | undefined>();
  const [checked, setChecked] = React.useState(false);
  const [selected, setSelected] = React.useState(false);
  const [active, setActive] = React.useState(false);
  return (
    <>
      <Title text="Form" />
      <View>
        <Input label="Default" placeholder="Lorem ipsum dolor sit amet" />
        <Input label="Error" error="This is a message error" />
        <Input label="Focused" />
        <Select
          label="Select"
          options={options}
          value={value}
          onSelect={(option) => setValue(option)}
          error="This is a message error"
        />

        <Checkbox.Root
          checked={checked}
          onChange={setChecked}
          accessibilityLabel="accept terms of condition"
          className="pb-2"
        >
          <Checkbox.Icon checked={checked} />
          <Checkbox.Label text="checkbox" />
        </Checkbox.Root>

        <Radio.Root
          checked={selected}
          onChange={setSelected}
          accessibilityLabel="radio button"
          className="pb-2"
        >
          <Radio.Icon checked={selected} colorScheme="primary" />
          <Radio.Label text="radio button" />
        </Radio.Root>

        <Switch.Root
          checked={active}
          onChange={setActive}
          accessibilityLabel="switch"
          className="pb-2"
        >
          <Switch.Icon checked={active} colorScheme="success" />
          <Switch.Label text="switch" />
        </Switch.Root>
      </View>
    </>
  );
};
