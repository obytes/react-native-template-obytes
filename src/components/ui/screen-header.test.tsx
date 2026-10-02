import * as React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { ScreenHeader } from './screen-header';

jest.mock('./screen-layout', () => ({ useScreenTopPadding: jest.fn(() => 59) }));

afterEach(cleanup);

describe('screen header', () => {
  it('renders the kicker pattern with a back button and title', async () => {
    const onBack = jest.fn();
    const { user } = setup(<ScreenHeader testID="h" kicker="Shop" title="Merchandise" onBack={onBack} />);
    expect(screen.getByText('Shop')).toBeOnTheScreen();
    expect(screen.getByText('Merchandise')).toHaveStyle({ fontSize: 32 });
    const back = screen.getByTestId('h-back');
    expect(back.props.accessibilityLabel).toBe('Back');
    await user.press(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('hides the back button without a handler', () => {
    render(<ScreenHeader testID="h" kicker="Profile" />);
    expect(screen.queryByTestId('h-back')).toBeNull();
  });

  it('renders the tab-root pattern with a title and right slot', () => {
    render(
      <ScreenHeader
        variant="tab-root"
        title="Our Stables"
        subtitle="Every horse in our club."
        right={<ScreenHeader kicker="slot" safeArea={false} />}
      />,
    );
    expect(screen.getByText('Our Stables')).toBeOnTheScreen();
    expect(screen.getByText('Every horse in our club.')).toBeOnTheScreen();
    expect(screen.getByText('slot')).toBeOnTheScreen();
  });

  it('renders the brand submark on Home', () => {
    render(<ScreenHeader variant="tab-root" brand />);
    expect(screen.getByLabelText('Rionna')).toBeOnTheScreen();
  });
});
