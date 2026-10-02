import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import colors from './colors';
import { CustomTabBar } from './tab-bar';

jest.mock('./tab-bar-layout', () => ({
  ...jest.requireActual('./tab-bar-layout'),
  useTabBarBottomOffset: jest.fn(() => 34),
}));

afterEach(cleanup);

const ROUTES = ['index', 'stables', 'community', 'events', 'paddock'];
const TITLES: Record<string, string> = {
  index: 'Home',
  stables: 'Stables',
  community: 'Community',
  events: 'Events',
  paddock: 'The Paddock',
};

function makeProps(activeIndex: number, emitPrevented = false) {
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: emitPrevented }));
  const routes = ROUTES.map(name => ({ key: `${name}-key`, name, params: undefined }));
  const descriptors = Object.fromEntries(
    routes.map(r => [r.key, { options: { title: TITLES[r.name], tabBarButtonTestID: `tab-${r.name}` } }]),
  );
  const props = {
    state: { index: activeIndex, routes },
    descriptors,
    navigation: { navigate, emit },
  } as unknown as BottomTabBarProps;
  return { props, navigate, emit };
}

describe('custom tab bar', () => {
  it('renders five labelled tabs with the active one selected', () => {
    const { props } = makeProps(0);
    render(<CustomTabBar {...props} />);
    for (const name of ROUTES) {
      const tab = screen.getByTestId(`tab-${name}`);
      expect(tab.props.accessibilityRole).toBe('tab');
      expect(tab.props.accessibilityLabel).toBe(TITLES[name]);
      expect(tab.props.accessibilityState).toEqual({ selected: name === 'index' });
    }
  });

  it('fills the active tab navy and leaves inactive tabs clear', () => {
    const { props } = makeProps(1);
    render(<CustomTabBar {...props} />);
    expect(screen.getByTestId('tab-stables')).toHaveStyle({ backgroundColor: colors.primary, width: 44, height: 44 });
    expect(screen.getByTestId('tab-index')).not.toHaveStyle({ backgroundColor: colors.primary });
  });

  it('always renders Community as the 52pt lilac circle, ringed when active', () => {
    const inactive = makeProps(0);
    const { rerender } = render(<CustomTabBar {...inactive.props} />);
    expect(screen.getByTestId('tab-community')).toHaveStyle({ width: 52, backgroundColor: colors.primaryFixed });
    expect(screen.getByTestId('tab-community')).not.toHaveStyle({ borderWidth: 2 });

    const active = makeProps(2);
    rerender(<CustomTabBar {...active.props} />);
    expect(screen.getByTestId('tab-community')).toHaveStyle({
      backgroundColor: colors.primaryFixed,
      borderWidth: 2,
      borderColor: colors.plumMid,
    });
  });

  it('sizes the pill to the Figma component', () => {
    const { props } = makeProps(0);
    render(<CustomTabBar {...props} />);
    expect(screen.getByTestId('tab-bar')).toHaveStyle({ height: 60, borderRadius: 30, width: 350 });
  });

  it('navigates on press of an inactive tab', async () => {
    const { props, navigate, emit } = makeProps(0);
    const { user } = setup(<CustomTabBar {...props} />);
    await user.press(screen.getByTestId('tab-events'));
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'tabPress', target: 'events-key' }));
    expect(navigate).toHaveBeenCalledWith('events', undefined);
  });

  it('does not navigate for the focused tab', async () => {
    const focused = makeProps(0);
    const { user } = setup(<CustomTabBar {...focused.props} />);
    await user.press(screen.getByTestId('tab-index'));
    expect(focused.navigate).not.toHaveBeenCalled();
  });

  it('does not navigate when the press is prevented', async () => {
    const prevented = makeProps(0, true);
    const second = setup(<CustomTabBar {...prevented.props} />);
    await second.user.press(screen.getByTestId('tab-stables'));
    expect(prevented.navigate).not.toHaveBeenCalled();
  });
});
