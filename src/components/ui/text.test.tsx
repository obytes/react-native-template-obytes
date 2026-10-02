import type { TextVariant } from './text-variants';
import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { Text } from './text';
import { TEXT_VARIANTS, textVariantStyle } from './text-variants';

afterEach(cleanup);

describe('text type ramp', () => {
  it.each<[TextVariant, number, number]>([
    ['display-xl', 44, 44],
    ['display-lg', 32, 34],
    ['display-md', 26, 28],
    ['display-sm', 21, 24],
    ['title', 16, 20],
    ['body-lg', 15, 22],
    ['body', 14, 20],
    ['body-sm', 12, 16],
    ['label', 12, 14],
    ['label-sm', 10, 12],
  ])('%s is %ipt on a %ipt line', (variant, fontSize, lineHeight) => {
    expect(textVariantStyle(variant)).toMatchObject({ fontSize, lineHeight });
  });

  it('respects the mono 10 / body 12 floors', () => {
    for (const [name, spec] of Object.entries(TEXT_VARIANTS)) {
      const floor = spec.className.includes('font-mono') ? 10 : 12;
      expect({ name, ok: spec.fontSize >= floor }).toEqual({ name, ok: true });
    }
  });

  it('converts tracking from em to points', () => {
    expect(textVariantStyle('display-xl').letterSpacing).toBe(-0.44);
    expect(textVariantStyle('label').letterSpacing).toBe(0.48);
    expect(textVariantStyle('title').letterSpacing).toBe(0);
  });

  it('uses the display, sans and mono families', () => {
    expect(TEXT_VARIANTS['display-lg'].className).toContain('font-display');
    expect(TEXT_VARIANTS.body.className).toContain('font-sans');
    expect(TEXT_VARIANTS['label-sm'].className).toContain('font-mono');
    expect(TEXT_VARIANTS['label-sm'].className).toContain('uppercase');
  });

  it('applies the variant style and caps Dynamic Type at 1.2 for display', () => {
    render(<Text variant="display-md">Hello</Text>);
    const node = screen.getByText('Hello');
    expect(node).toHaveStyle({ fontSize: 26, lineHeight: 28 });
    expect(node.props.maxFontSizeMultiplier).toBe(1.2);
  });

  it('caps Dynamic Type at 1.3 by default, with or without a variant', () => {
    render(
      <>
        <Text>Plain</Text>
        <Text variant="body">Body</Text>
      </>,
    );
    expect(screen.getByText('Plain').props.maxFontSizeMultiplier).toBe(1.3);
    expect(screen.getByText('Body').props.maxFontSizeMultiplier).toBe(1.3);
  });

  it('lets callers override the cap and the style', () => {
    render(
      <Text variant="body" maxFontSizeMultiplier={2} style={{ lineHeight: 30 }}>
        Custom
      </Text>,
    );
    const node = screen.getByText('Custom');
    expect(node.props.maxFontSizeMultiplier).toBe(2);
    expect(node).toHaveStyle({ fontSize: 14, lineHeight: 30 });
  });
});
