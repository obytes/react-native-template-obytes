import React from 'react';
import {TouchableOpacity} from 'react-native';
import {
  useRestyle,
  spacing,
  border,
  backgroundColor,
  SpacingProps,
  BorderProps,
  BackgroundColorProps,
  VariantProps,
  createRestyleComponent,
  createVariant,
  TextShadowProps,
  TypographyProps,
  ColorProps,
} from '@shopify/restyle';

import {Text} from './Text';
import {View} from './View';
import {Theme} from './theme';

const buttonVariant = createVariant({themeKey: 'buttonVariants'});
const ButtonContainer = createRestyleComponent<
  VariantProps<Theme, 'buttonVariants'> & React.ComponentProps<typeof View>,
  Theme
>([buttonVariant], View);

const restyleFunctions = [
  buttonVariant as any,
  spacing,
  border,
  backgroundColor,
];

type Props = SpacingProps<Theme> &
  VariantProps<Theme, 'buttonVariants'> &
  ColorProps<Theme> &
  BorderProps<Theme> &
  TextShadowProps<Theme> &
  TypographyProps<Theme> &
  BackgroundColorProps<Theme> & {
    onPress: () => void;
    label?: string;
  };

export const Button = ({
  onPress,
  label,
  variant = 'primary',
  ...rest
}: Props) => {
  const props = useRestyle(restyleFunctions, {...rest, variant});

  return (
    <TouchableOpacity onPress={onPress}>
      <ButtonContainer
        borderRadius={5}
        flexDirection="row"
        paddingVertical="m"
        paddingHorizontal="xl"
        marginVertical="s"
        justifyContent="center"
        {...props}>
        <Text variant="button">{label}</Text>
      </ButtonContainer>
    </TouchableOpacity>
  );
};
