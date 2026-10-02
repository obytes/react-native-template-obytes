import type { ProgressBarRef } from './progress-bar';
import * as React from 'react';
import { View } from 'react-native';

import { act, cleanup, render, screen } from '@/lib/test-utils';

import colors from './colors';
import { ProgressBar } from './progress-bar';

afterEach(cleanup);

describe('progress bar', () => {
  it('renders a cream track with a navy fill at the given value', () => {
    render(<ProgressBar testID="bar" value={68} />);
    expect(screen.getByTestId('bar')).toHaveStyle({ backgroundColor: colors.secondaryContainer, height: 8 });
    expect(screen.getByTestId('bar-fill')).toHaveStyle({ backgroundColor: colors.primary });
    expect(screen.getByTestId('bar').props.accessibilityValue).toMatchObject({ now: 68, max: 100 });
  });

  it('uses a lilac fill on plum', () => {
    render(<ProgressBar testID="bar" value={10} tone="on-plum" />);
    expect(screen.getByTestId('bar-fill')).toHaveStyle({ backgroundColor: colors.primaryFixed });
  });

  it('clamps the value', () => {
    render(<ProgressBar testID="bar" value={140} />);
    expect(screen.getByTestId('bar').props.accessibilityValue).toMatchObject({ now: 100 });
  });

  it('renders a thumb when given one', () => {
    render(<ProgressBar value={50} renderThumb={() => <View testID="thumb" />} />);
    expect(screen.getByTestId('thumb')).toBeOnTheScreen();
  });

  it('keeps the imperative setProgress API', () => {
    const ref: React.RefObject<ProgressBarRef | null> = { current: null };
    render(<ProgressBar testID="bar" ref={ref} />);
    act(() => ref.current?.setProgress(40));
    expect(screen.getByTestId('bar').props.accessibilityValue).toMatchObject({ now: 40 });
  });
});
