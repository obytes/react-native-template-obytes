import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { PaddockHubView } from '@/features/paddock/screens/paddock-screen';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});
jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 70 }));
jest.mock('@/components/ui/tab-bar-layout', () => ({ useTabBarContentPadding: () => 120 }));

function renderHub(overrides: Partial<React.ComponentProps<typeof PaddockHubView>> = {}) {
  const props = {
    offersCount: 3,
    charitySummary: '\u20AC24,500 raised to date. Vote on what\u2019s next',
    onOpenBenefits: jest.fn(),
    onOpenCharity: jest.fn(),
    ...overrides,
  };
  render(<PaddockHubView {...props} />);
  return props;
}

describe('paddockHubView', () => {
  it('renders the heading and live rows, and navigates on press', () => {
    const { onOpenBenefits, onOpenCharity } = renderHub();
    expect(screen.getByText('Paddock')).toBeOnTheScreen();
    expect(screen.getByText('3 offers')).toBeOnTheScreen();
    expect(screen.getByText('\u20AC24,500 raised to date. Vote on what\u2019s next')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('paddock-row-Membership Benefits'));
    fireEvent.press(screen.getByTestId('paddock-row-Charity Snapshot'));
    expect(onOpenBenefits).toHaveBeenCalledTimes(1);
    expect(onOpenCharity).toHaveBeenCalledTimes(1);
  });

  it('shows Merchandise as a disabled coming-soon row', () => {
    renderHub();
    expect(screen.getByText('Merchandise')).toBeOnTheScreen();
    expect(screen.getByText('Coming soon')).toBeOnTheScreen();
    expect(screen.getByTestId('paddock-row-Merchandise')).toHaveProp('accessibilityState', { disabled: true });
  });

  it('does not render a Competitions row', () => {
    renderHub();
    expect(screen.queryByText('Competitions')).not.toBeOnTheScreen();
  });

  it('hides the journey card until a badge exists', () => {
    renderHub();
    expect(screen.queryByTestId('journey-card')).not.toBeOnTheScreen();
    expect(screen.queryByText('My Rionna journey')).not.toBeOnTheScreen();
  });

  it('shows the Founding Member badge when flagged', () => {
    renderHub({ badges: ['founding-member'] });
    expect(screen.getByTestId('journey-card')).toBeOnTheScreen();
    expect(screen.getByText('Founding Member')).toBeOnTheScreen();
  });

  it('falls back to the static benefits subtitle when unknown', () => {
    renderHub({ offersCount: null });
    expect(screen.getByText('Restaurants, hotels, lifestyle partners')).toBeOnTheScreen();
  });
});
