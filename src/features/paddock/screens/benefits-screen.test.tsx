import type { Offer } from '@/features/paddock/types';

import { render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { BenefitsView } from '@/features/paddock/screens/benefits-screen';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null, Image: 'Image' };
});
jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 70 }));
jest.mock('@/components/ui/tab-bar-layout', () => ({ useTabBarContentPadding: () => 120 }));

const OFFER: Offer = {
  id: 'o1',
  title: '15% off stays',
  partnerName: 'The Shelbourne',
  category: 'hotel',
  description: 'd',
  imageUrl: null,
  discountCode: 'RIONNA15',
  redeemUrl: null,
  howToRedeem: null,
  validUntil: null,
};

const base = { isLoading: false, isError: false, isRefetching: false, onRefresh: jest.fn(), onCopyCode: jest.fn(), onOpenLink: jest.fn() };

describe('benefitsView', () => {
  it('renders offer cards', () => {
    render(<BenefitsView {...base} offers={[OFFER]} />);
    expect(screen.getByText('15% off stays')).toBeOnTheScreen();
  });
  it('shows the empty state when there are no offers', () => {
    render(<BenefitsView {...base} offers={[]} />);
    expect(screen.getByTestId('benefits-empty')).toBeOnTheScreen();
  });
  it('shows the new-partners copy and no Active/Redeemed tabs', () => {
    render(<BenefitsView {...base} offers={[]} />);
    expect(screen.getByText('New partners are on the way')).toBeOnTheScreen();
    expect(screen.queryByText('Redeemed')).toBeNull();
  });
  it('shows the unavailable state on error', () => {
    render(<BenefitsView {...base} offers={undefined} isError />);
    expect(screen.getByTestId('benefits-unavailable')).toBeOnTheScreen();
  });
  it('shows a loading indicator before the first response', () => {
    render(<BenefitsView {...base} offers={undefined} isLoading />);
    expect(screen.getByTestId('benefits-loading')).toBeOnTheScreen();
  });
});
