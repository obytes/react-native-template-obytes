import * as React from 'react';
import {TextInput, TextStyle, TextInputProps, StyleSheet} from 'react-native';
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
      <View marginBottom="s" key={`input-${name}`}>
        {label && <Text variant="label">{label}</Text>}
        <View
          borderColor="grey4"
          borderWidth={2}
          borderRadius={10}
          style={styles.inputContainer}>
          <TextInput
            placeholderTextColor="#666666"
            style={styles.input}
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

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#FAFAFA',
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 15,
    padding: 12,
  },
});
