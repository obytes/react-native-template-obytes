import { Dimensions, Platform } from 'react-native';

export const IS_IOS = Platform.OS === 'ios';
const { width, height } = Dimensions.get('screen');

export const WIDTH = width;
export const HEIGHT = height;

export const COLORS = {
  WHITE: '#ffffff',
  PINK: '#F75369',
  WARM_PINK: '#fc6276',
  WHITE_TWO: '#f9f9f9',
  SLATE_GREY: '#4e4e56',
  SILVER: '#d1d3d4',
};
