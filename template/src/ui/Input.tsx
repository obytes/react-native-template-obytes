import { styled } from 'nativewind';
import * as React from 'react';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useController } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import { TextInput as NTextInput } from 'react-native';
import colors from 'tailwindcss/colors';

import { Text, View } from './core';

// types

const STextInput = styled(NTextInput);

type TRule = Omit<
  RegisterOptions,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs'
>;

export type RuleType<T> = { [name in keyof T]: TRule };
export type InputControllerType<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  rules?: TRule;
};

interface Props<T extends FieldValues>
  extends TextInputProps,
    InputControllerType<T> {
  disabled?: boolean;
  label?: string;
}

export function Input<T extends FieldValues>(props: Props<T>) {
  const { label, name, control, rules, ...inputProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  const [isFocussed, setIsFocussed] = React.useState(false);
  const onBlur = () => setIsFocussed(false);
  const onFocus = () => setIsFocussed(true);

  const borderColor = fieldState.invalid
    ? 'border-b-red-600'
    : isFocussed
    ? 'border-b-indigo-600'
    : 'border-b-gray-300';
  return (
    <View key={`input-${name}`} className="mb-4">
      {label && <Text variant="label">{label}</Text>}
      <STextInput
        placeholderTextColor={colors.gray[300]}
        className={`mt-0 border-b-[1px] py-2  ${borderColor}`}
        autoCapitalize="none"
        onChangeText={field.onChange}
        value={field.value as string}
        onBlur={onBlur}
        onFocus={onFocus}
        {...inputProps}
      />
      {fieldState.error && (
        <Text variant="error">{fieldState.error.message}</Text>
      )}
    </View>
  );
}
