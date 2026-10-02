import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { MonoLabel, Tag } from './mono-label';

afterEach(cleanup);

describe('mono label', () => {
  it('uses label-sm in label navy by default', () => {
    render(<MonoLabel testID="l">My horses</MonoLabel>);
    const el = screen.getByTestId('l');
    expect(el).toHaveStyle({ fontSize: 10 });
    expect(el.props.className).toContain('text-label');
    expect(el.props.className).toContain('uppercase');
  });

  it('switches to lilac on dark and the larger label size', () => {
    render(<MonoLabel testID="l" tone="dark" size="md">Shop</MonoLabel>);
    const el = screen.getByTestId('l');
    expect(el).toHaveStyle({ fontSize: 12 });
    expect(el.props.className).toContain('text-on-primary-container');
  });
});

describe('tag', () => {
  it.each([
    ['forest', 'bg-forest'],
    ['ice', 'bg-ice-light'],
    ['ice-outline', 'border-ice'],
    ['navy', 'bg-primary'],
  ] as const)('renders the %s tag', (variant, cls) => {
    render(<Tag testID="t" label="New" variant={variant} />);
    expect(screen.getByText('New')).toBeOnTheScreen();
    expect(screen.getByTestId('t').props.className).toContain(cls);
  });
});
