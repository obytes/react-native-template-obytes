import { render, screen } from '@testing-library/react-native';
import React, { createRef } from 'react';
import { getAnimatedStyle } from 'react-native-reanimated';

import type { ProgressBarRef } from './progress-bar';
import { ProgressBar } from './progress-bar';

describe('ProgressBar component', () => {
  it('renders correctly', () => {
    render(<ProgressBar className="custom-class" />);
    expect(screen.getByTestId('progress-bar-container')).toBeTruthy();
  });

  it('sets initial progress correctly', () => {
    render(<ProgressBar initialProgress={50} />);
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar.props.style).toEqual(
      expect.objectContaining({ width: '50%' })
    );
  });

  it('setProgress function works correctly', async () => {
    const finalValue = 75;
    const progressAnimationDuration = 250;
    const ref = createRef<ProgressBarRef>();
    render(<ProgressBar ref={ref} initialProgress={0} />);
    const progressBar = screen.getByTestId('progress-bar');

    // Call setProgress and check the updated value
    if (ref.current) {
      expect(getAnimatedStyle(progressBar)).toMatchObject({ width: '0%' });
      jest.useFakeTimers();
      ref.current.setProgress(finalValue);
      jest.advanceTimersByTime(progressAnimationDuration); // Duration of the animation
      const updatedProgressBar = await screen.findByTestId('progress-bar');
      expect(getAnimatedStyle(updatedProgressBar)).toMatchObject({
        width: `${finalValue}%`,
      });
    }
  });
});
