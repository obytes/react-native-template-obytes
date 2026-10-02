import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { StorySection } from '@/features/stables/components/story-section';

describe('storySection', () => {
  it('renders nothing when there is no story or pedigree', () => {
    const { toJSON } = render(<StorySection story={null} pedigree={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders a short story without a "Read more" toggle', () => {
    render(<StorySection story="A short and sweet story." pedigree={[]} />);

    expect(screen.getByText('Story & pedigree')).toBeOnTheScreen();
    expect(screen.getByText('A short and sweet story.')).toBeOnTheScreen();
    expect(screen.queryByText('Read more')).toBeNull();
  });

  it('collapses a long story behind "Read more" and expands on tap', () => {
    const longStory = 'x'.repeat(600);
    render(<StorySection story={longStory} pedigree={[]} />);

    expect(screen.getByText('Read more')).toBeOnTheScreen();
    expect(screen.queryByText(longStory)).toBeNull();

    fireEvent.press(screen.getByText('Read more'));

    expect(screen.getByText(longStory)).toBeOnTheScreen();
    expect(screen.getByText('Show less')).toBeOnTheScreen();
  });

  it('labels the second row Dam (the Figma duplicate "Sire" is a typo) and adds Dam\'s sire', () => {
    render(
      <StorySection
        story={null}
        pedigree={[
          { key: 'sire', value: 'Galileo' },
          { key: 'dam', value: 'Urban Sea' },
          { key: 'damsire', value: 'Miswaki' },
          { key: 'foaled', value: 'May 2023 · Co. Meath' },
        ]}
      />,
    );

    expect(screen.getByText('Sire')).toBeOnTheScreen();
    expect(screen.getByText('Galileo')).toBeOnTheScreen();
    expect(screen.getByText('Dam')).toBeOnTheScreen();
    expect(screen.getByText('Urban Sea')).toBeOnTheScreen();
    expect(screen.getByText('Dam\'s sire')).toBeOnTheScreen();
    expect(screen.getByText('Foaled')).toBeOnTheScreen();
  });
});
