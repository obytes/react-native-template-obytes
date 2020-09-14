import * as React from 'react';
import {TextInput, TextStyle, TextInputProps} from 'react-native';
import {FieldError} from 'react-hook-form';

import {Text} from './Text';
import {View} from './View';

interface Props extends TextInputProps {
  name: string;
  disabled?: boolean;
  label?: string;
  labelStyle?: TextStyle;
  error?: FieldError | undefined;
  password?: boolean;
}

export const Input = React.forwardRef<any, Props>(
  (props, ref): React.ReactElement => {
    const {label, error, disabled, password, name, ...inputProps} = props;

    return (
      <View marginVertical="m" key={`input-${name}`}>
        {label && <Text marginVertical="s">{label}</Text>}
        <View>
          <TextInput
            autoCapitalize="none"
            ref={ref}
            editable={!disabled}
            secureTextEntry={password}
            {...inputProps}
          />
        </View>
        <Text style={{color: '#fc6d47'}}>{error && error.message}</Text>
      </View>
    );
  },
);
