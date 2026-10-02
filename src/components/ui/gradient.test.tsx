import type { GradientVariant } from './gradient-styles';
import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import colors from './colors';
import { Gradient, ScreenBackground } from './gradient';
import { GRADIENTS, gradientStyle, withAlpha } from './gradient-styles';

// RN's own parser for `experimental_backgroundImage`; an unparseable string
// yields [] (and silently renders nothing on device), so run every variant
// through it. Jest can't paint gradients; on-device verification is manual.
const processBackgroundImage: (input: string) => { type: string }[]
  = require('react-native/Libraries/StyleSheet/processBackgroundImage').default;

afterEach(cleanup);

const VARIANTS = Object.keys(GRADIENTS) as GradientVariant[];

describe('gradient', () => {
  it('defines the six design variants plus the photo scrim', () => {
    expect(VARIANTS.sort()).toEqual([
      'card-plum-glow',
      'card-sage-glow',
      'page',
      'page-ice',
      'photo-scrim',
      'welcome-light',
      'welcome-navy',
    ]);
  });

  it.each(VARIANTS)('%s parses with RN\'s background-image parser', (variant) => {
    const style = gradientStyle(variant);
    const parsed = processBackgroundImage(style.experimental_backgroundImage as string);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].type).toBe(variant.startsWith('card-') ? 'radial-gradient' : 'linear-gradient');
  });

  it('maps page to the cream → lilac@10% wash over the paper base', () => {
    expect(gradientStyle('page')).toEqual({
      backgroundColor: colors.surface,
      experimental_backgroundImage: `linear-gradient(to bottom, ${colors.secondaryContainer} 0%, ${colors.onPrimaryContainer}1a 100%)`,
    });
  });

  it('maps welcome-navy to the three navy stops', () => {
    const image = gradientStyle('welcome-navy').experimental_backgroundImage as string;
    expect(image).toContain(`${colors.navyDeep} 0%`);
    expect(image).toContain(`${colors.primary} 60%`);
    expect(image).toContain(`${colors.primaryContainer} 100%`);
  });

  it('keeps card glows transparent (no base colour) so the pattern shows through', () => {
    expect(gradientStyle('card-plum-glow').backgroundColor).toBeUndefined();
    expect(gradientStyle('card-sage-glow').backgroundColor).toBeUndefined();
  });

  it('withAlpha appends a two-digit alpha channel', () => {
    expect(withAlpha(colors.ink, 0.12)).toBe(colors.outlineVariant);
    expect(withAlpha(colors.ink, 0)).toBe(`${colors.ink}00`);
    expect(withAlpha(colors.ink, 1)).toBe(`${colors.ink}ff`);
  });

  it('renders the variant style and merges caller style', () => {
    render(<Gradient testID="g" variant="welcome-light" style={{ padding: 4 }} />);
    expect(screen.getByTestId('g')).toHaveStyle({
      backgroundColor: colors.white,
      padding: 4,
    });
  });

  it('screenBackground is a non-interactive full-screen layer', () => {
    render(<ScreenBackground testID="bg" />);
    const bg = screen.getByTestId('bg');
    expect(bg).toHaveStyle({ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 });
    expect(bg.props.pointerEvents).toBe('none');
  });
});
