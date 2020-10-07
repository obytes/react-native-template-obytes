import React from 'react';
import {Button, Input, Screen, Text, View} from 'ui';

export const Style = () => {
  return (
    <Screen>
      <View flex={1} paddingTop="xl" justifyContent="center">
        <Text variant="header">This a Header</Text>
        <Text variant="subheader">This a SubHeader</Text>
        <Text variant="body">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae
          temporibus soluta tenetur doloremque ut incidunt sequi explicabo
          quisquam nostrum laborum deserunt libero dolore, quidem eius! Eaque
          aperiam necessitatibus dignissimos velit.
        </Text>
        <Button variant="primary" label="Primary button " onPress={() => {}} />
        <Button
          variant="secondary"
          label="secondary button "
          onPress={() => {
            throw new Error();
          }}
        />
        <Input
          label="This is an Input "
          name="input"
          placeholder="a placeholder"
        />
      </View>
    </Screen>
  );
};
