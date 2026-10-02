import type { Offer } from '@/features/paddock/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { OfferCard } from '@/features/paddock/components/offer-card';
import { formatValidTo } from '@/features/paddock/lib/format-valid-to';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, Image: 'Image' };
});

const BASE: Offer = {
  id: 'o1',
  title: '15% off stays',
  partnerName: 'The Shelbourne',
  category: 'hotel',
  description: 'Sunday to Thursday.',
  imageUrl: null,
  discountCode: null,
  redeemUrl: null,
  howToRedeem: null,
  validUntil: null,
};

describe('offerCard', () => {
  it('shows a copy button for a discount code and forwards the code', () => {
    const onCopyCode = jest.fn();
    render(<OfferCard offer={{ ...BASE, discountCode: 'RIONNA15' }} onCopyCode={onCopyCode} onOpenLink={jest.fn()} />);
    fireEvent.press(screen.getByTestId('offer-copy-o1'));
    expect(onCopyCode).toHaveBeenCalledWith('RIONNA15');
  });

  it('shows an open-link button for a redeem url', () => {
    const onOpenLink = jest.fn();
    render(<OfferCard offer={{ ...BASE, redeemUrl: 'https://example.com/deal' }} onCopyCode={jest.fn()} onOpenLink={onOpenLink} />);
    fireEvent.press(screen.getByTestId('offer-link-o1'));
    expect(onOpenLink).toHaveBeenCalledWith('https://example.com/deal');
  });

  it('reveals the how-to-redeem line on tap and shows no buttons', () => {
    render(<OfferCard offer={{ ...BASE, howToRedeem: 'Show this screen at the till' }} onCopyCode={jest.fn()} onOpenLink={jest.fn()} />);
    expect(screen.queryByText('Show this screen at the till')).toBeNull();
    fireEvent.press(screen.getByTestId('offer-toggle-o1'));
    expect(screen.getByText('Show this screen at the till')).toBeOnTheScreen();
    expect(screen.queryByTestId('offer-copy-o1')).toBeNull();
    expect(screen.queryByTestId('offer-link-o1')).toBeNull();
  });

  it('shows partner, offer line and valid-to month', () => {
    render(<OfferCard offer={{ ...BASE, validUntil: '2026-09-30T12:00:00.000Z' }} onCopyCode={jest.fn()} onOpenLink={jest.fn()} />);
    expect(screen.getByText('The Shelbourne')).toBeOnTheScreen();
    expect(screen.getByText('15% off stays; Valid to September')).toBeOnTheScreen();
  });

  it('omits the valid-to part when there is no date', () => {
    render(<OfferCard offer={BASE} onCopyCode={jest.fn()} onOpenLink={jest.fn()} />);
    expect(screen.getByText('15% off stays')).toBeOnTheScreen();
  });
});

describe('formatValidTo', () => {
  it('formats the month or returns null', () => {
    expect(formatValidTo('2026-03-15T00:00:00.000Z')).toBe('Valid to March');
    expect(formatValidTo(null)).toBeNull();
    expect(formatValidTo('nope')).toBeNull();
  });
});
