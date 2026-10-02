import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import { ScrollView } from 'react-native';

import { PhotoCarousel } from '@/features/stables/components/photo-carousel';

jest.mock('@/components/ui', () => ({
  Image: 'Image',
}));

const PHOTOS = [
  { url: 'https://cdn.test/one.jpg' },
  { url: 'https://cdn.test/two.jpg', caption: 'Morning gallop' },
  { url: 'https://cdn.test/three.jpg' },
];

describe('photoCarousel', () => {
  it('renders a single photo statically', () => {
    render(<PhotoCarousel photos={[PHOTOS[0]]} />);

    expect(screen.getByTestId('photo-carousel-single')).toBeOnTheScreen();
    expect(screen.queryByTestId('photo-carousel')).toBeNull();
  });

  it('renders a swipable pager and reports the settled page', () => {
    const onIndexChange = jest.fn();
    render(<PhotoCarousel photos={PHOTOS} onIndexChange={onIndexChange} />);

    const pager = screen.getByTestId('photo-carousel');
    fireEvent(pager, 'layout', { nativeEvent: { layout: { width: 390, height: 390, x: 0, y: 0 } } });
    fireEvent(screen.UNSAFE_getByType(ScrollView), 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 780, y: 0 } },
    });

    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it('renders a placeholder when there are no photos', () => {
    render(<PhotoCarousel photos={[]} />);

    expect(screen.getByTestId('photo-carousel-placeholder')).toBeOnTheScreen();
  });
});
