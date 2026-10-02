import * as React from 'react';
import { Switch } from 'react-native';

import { colors } from '@/components/ui';

type PreferenceSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
  testID?: string;
};

/** Navy track when on, ice track when off (S13-08). */
export function PreferenceSwitch({ value, onValueChange, disabled, label, testID }: PreferenceSwitchProps) {
  return (
    <Switch
      testID={testID}
      accessibilityLabel={label}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ true: colors.primary, false: colors.ice }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.ice}
    />
  );
}
