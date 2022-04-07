import React from 'react';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {
  useRestyle,
  spacing,
  border,
  backgroundColor,
  SpacingProps,
  BorderProps,
  BackgroundColorProps,
  VariantProps,
  composeRestyleFunctions,
  createRestyleComponent,
  createVariant,
} from '@shopify/restyle';

import {Text} from './Text';
import {View} from './View';
import {Theme} from './theme';

const buttonVariant = createVariant({themeKey: 'buttonVariants'});
const ButtonContainer = createRestyleComponent<
  VariantProps<Theme, 'buttonVariants'> & React.ComponentProps<typeof View>,
  Theme
>([buttonVariant], View);

const restyleFunctions = composeRestyleFunctions([
  buttonVariant as any,
  spacing,
  border,
  backgroundColor,
]);

type Props = SpacingProps<Theme> &
  VariantProps<Theme, 'buttonVariants'> &
  BorderProps<Theme> &
  BackgroundColorProps<Theme> & {
    onPress: () => void;
    label?: string;
    outline?: boolean;
    loading?: boolean;
  };

export const Button = ({
  onPress,
  label,
  loading = false,
  variant = 'primary',
  ...rest
}: Props) => {
  const props = useRestyle(restyleFunctions, {...rest, variant});
  const textVariant = 'button_' + variant;

  return (
    <TouchableOpacity onPress={onPress}>
      <ButtonContainer
        borderRadius={44}
        flexDirection="row"
        paddingVertical="m"
        paddingHorizontal="xl"
        marginVertical="s"
        justifyContent="center"
        {...props}>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text variant={textVariant as Partial<keyof Theme['textVariants']>}>
            {label}
          </Text>
        )}
      </ButtonContainer>
    </TouchableOpacity>
  );
};
