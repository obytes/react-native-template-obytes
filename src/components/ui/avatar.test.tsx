import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { Avatar } from './avatar';

afterEach(cleanup);

describe('avatar', () => {
  it('shows initials on lilac without a photo', () => {
    render(<Avatar testID="av" name="Sarah Kavanagh" />);
    expect(screen.getByTestId('av-initials')).toHaveTextContent('SK');
    expect(screen.getByTestId('av').props.className).toContain('bg-primary-fixed');
    expect(screen.getByTestId('av').props.accessibilityLabel).toBe('Sarah Kavanagh');
  });

  it('shows the photo when a uri is given', () => {
    render(<Avatar testID="av" name="Sarah" uri="https://example.com/a.jpg" />);
    expect(screen.getByTestId('av-image')).toBeOnTheScreen();
    expect(screen.queryByTestId('av-initials')).toBeNull();
  });

  it('draws the lilac ring outside the photo', () => {
    render(<Avatar testID="av" name="Sarah" ring size={41} />);
    expect(screen.getByTestId('av').props.className).toContain('border-on-primary-container');
    expect(screen.getByTestId('av')).toHaveStyle({ width: 41, height: 41 });
  });

  it('uses the navy pattern fallback for horses', () => {
    render(<Avatar testID="av" name="Ashfield Rose" kind="horse" />);
    expect(screen.getByTestId('av-fallback', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByTestId('av-initials').props.className).toContain('text-on-primary');
  });
});
