import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { getInitials, PhotoFallback } from './photo-fallback';

afterEach(cleanup);

describe('getInitials', () => {
  it.each([
    ['Ashfield Rose', 'AR'],
    ['comeragh', 'C'],
    ['  Sarah  Jane Kavanagh ', 'SK'],
    ['', ''],
    [null, ''],
  ])('%s → %s', (name, out) => {
    expect(getInitials(name)).toBe(out);
  });
});

describe('photo fallback', () => {
  it.each([
    ['navy', 'bg-primary'],
    ['green', 'bg-forest'],
    ['plum', 'bg-plum'],
    ['cream', 'bg-secondary-container'],
  ] as const)('paints the %s colourway', (colourway, cls) => {
    render(<PhotoFallback testID="fb" colourway={colourway} />);
    expect(screen.getByTestId('fb', { includeHiddenElements: true }).props.className).toContain(cls);
  });

  it('centres initials in white on dark colourways and ink on cream', () => {
    render(
      <>
        <PhotoFallback testID="navy" colourway="navy" initials="AR" />
        <PhotoFallback testID="cream" colourway="cream" initials="IT" />
      </>,
    );
    expect(screen.getByTestId('navy-initials').props.className).toContain('text-on-primary');
    expect(screen.getByTestId('cream-initials').props.className).toContain('text-ink');
  });
});
