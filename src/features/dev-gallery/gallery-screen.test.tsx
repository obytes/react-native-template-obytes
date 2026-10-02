import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { GalleryScreen } from './gallery-screen';

jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: jest.fn(() => 59) }));
jest.mock('@/components/ui/tab-bar-layout', () => ({
  ...jest.requireActual('@/components/ui/tab-bar-layout'),
  useTabBarBottomOffset: jest.fn(() => 34),
}));

afterEach(cleanup);

describe('dev gallery', () => {
  it('renders every section', () => {
    render(<GalleryScreen />);
    for (const title of [
      'Type ramp',
      'Button',
      'IconButton',
      'Chip / ChipRow',
      'Card',
      'MonoLabel / Tag',
      'ListRow',
      'ScreenHeader',
      'Dots / ProgressBar',
      'FormField',
      'Avatar / PhotoFallback',
      'EmptyState / ErrorState / loading',
      'Tab bar',
      'Gradients',
      'Pattern kinds × colourways',
      'Logos',
      'V2 icons',
    ])
      expect(screen.getByText(title)).toBeOnTheScreen();
  });

  it('keeps the space between split-colour headline runs', () => {
    render(<GalleryScreen />);
    expect(screen.getByText('Ashfield Rose declares for Leopardstown')).toBeOnTheScreen();
  });
});
