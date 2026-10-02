import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { Dots } from './dots';

afterEach(cleanup);

describe('dots', () => {
  it('renders one dot per page and dims the inactive ones', () => {
    render(<Dots testID="dots" count={3} index={1} />);
    expect(screen.getByTestId('dots-0').props.className).toContain('opacity-30');
    expect(screen.getByTestId('dots-1').props.className).not.toContain('opacity-30');
    expect(screen.getByTestId('dots-2').props.className).toContain('opacity-30');
  });

  it('exposes the position to screen readers', () => {
    render(<Dots testID="dots" count={3} index={0} />);
    expect(screen.getByTestId('dots').props.accessibilityValue).toMatchObject({ now: 1, max: 3 });
  });
});
