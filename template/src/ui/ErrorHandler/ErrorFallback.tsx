import * as React from 'react';

import {Text} from '../Text';
import {View} from '../View';
import {Button} from '../Button';
import {Screen} from '../Screen';

export function ErrorFallback({resetErrorBoundary}: any) {
  return (
    <Screen>
      <View>
        <Text> Something went wrong: </Text>
        <Button label="try Again" onPress={resetErrorBoundary} />
      </View>
    </Screen>
  );
}
