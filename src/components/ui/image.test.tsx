import * as React from 'react';

import { act, cleanup, render, screen } from '@/lib/test-utils';

import { Image } from './image';

afterEach(cleanup);

describe('image fallback', () => {
  it('renders the pattern fallback when the source is missing', () => {
    render(<Image testID="img" source={null} fallback={{ colourway: 'navy', initials: 'AR' }} />);
    expect(screen.getByTestId('img-initials')).toHaveTextContent('AR');
  });

  it('switches to the fallback when the image fails to load', () => {
    const onError = jest.fn();
    render(<Image testID="img" source={{ uri: 'https://example.com/x.jpg' }} onError={onError} fallback={{ colourway: 'cream' }} />);
    act(() => {
      screen.getByTestId('img').props.onError({ nativeEvent: { error: 'boom' } });
    });
    expect(onError).toHaveBeenCalled();
    expect(screen.getByTestId('img', { includeHiddenElements: true }).props.className).toContain('bg-secondary-container');
  });

  it('keeps the plain image without a fallback', () => {
    render(<Image testID="img" source={{ uri: 'https://example.com/x.jpg' }} />);
    expect(screen.getByTestId('img')).toBeOnTheScreen();
  });
});
