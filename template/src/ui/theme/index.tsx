import * as React from 'react';
import {createTheme} from '@shopify/restyle';
import {ThemeProvider as ReThemeProvider} from '@shopify/restyle';
import {ReactNode} from 'react';
import {palette} from './palette';

export const theme = createTheme({
  colors: {
    mainBackground: palette.white,
    cardPrimaryBackground: palette.purplePrimary,
    textColor: palette.black,
    black: palette.black,
    white: palette.white,
  },
  spacing: {
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  navigation: {
    dark: false,
    colors: {
      primary: 'rgb(0, 122, 255)',
      background: '#f8f8fa',
      card: '#f8f8fa',
      text: '#0c1245',
      border: 'rgb(199, 199, 204)',
      notification: 'red',
    },
  },
  buttonVariants: {
    primary: {
      color: 'white',
      backgroundColor: 'black',
      fontSize: 16,
      fontWeight: 'bold',
      borderRadius: 5,
    },
  },
  textVariants: {
    header: {
      //fontFamily: 'ShopifySans-Bold',
      fontWeight: 'bold',
      fontSize: 34,
      lineHeight: 42.5,
      color: 'black',
    },
    subheader: {
      //fontFamily: 'ShopifySans-SemiBold',
      fontWeight: '600',
      fontSize: 28,
      lineHeight: 36,
      color: 'black',
    },
    body: {
      //fontFamily: 'ShopifySans',
      fontSize: 16,
      lineHeight: 24,
      color: 'black',
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      color: 'black',
    },
  },
});

export type Theme = typeof theme;

export const ThemeProvider = ({children}: {children: ReactNode}) => (
  <ReThemeProvider theme={theme}>{children}</ReThemeProvider>
);
