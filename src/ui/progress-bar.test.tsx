import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { getAnimatedStyle } from 'react-native-reanimated';

import type { ProgressBarRef } from './progress-bar';
import { ProgressBar } from './progress-bar';

describe('ProgressBar component', () => {
  const PROGRESS_BAR = 'progress-bar';
  it('renders correctly', () => {
    render(<ProgressBar className="custom-class" />);
    expect(screen.getByTestId('progress-bar-container')).toBeTruthy();
  });

  it('sets initial progress correctly', () => {
    render(<ProgressBar initialProgress={50} />);
    const progressBar = screen.getByTestId(PROGRESS_BAR);
    expect(progressBar.props.style).toEqual(
      expect.objectContaining({ width: '50%' })
    );
  });

  it('setProgress function works correctly', async () => {
    const finalValue = 75;
    const progressAnimationDuration = 250;
    const ref = createRef<ProgressBarRef>();
    render(<ProgressBar ref={ref} initialProgress={0} />);
    const progressBar = screen.getByTestId(PROGRESS_BAR);

    // Call setProgress and check the updated value
    if (ref.current) {
      expect(getAnimatedStyle(progressBar)).toMatchObject({ width: '0%' });
      jest.useFakeTimers();
      ref.current.setProgress(finalValue);
      jest.advanceTimersByTime(progressAnimationDuration); // Duration of the animation
      const updatedProgressBar = await screen.findByTestId(PROGRESS_BAR);
      expect(getAnimatedStyle(updatedProgressBar)).toMatchObject({
        width: `${finalValue}%`,
      });
    }
  });
});
