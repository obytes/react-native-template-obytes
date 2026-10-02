import * as React from 'react';

import { cleanup, render, screen } from '@/lib/test-utils';

import { Card } from './card';
import { Text } from './text';

afterEach(cleanup);

describe('card', () => {
  it.each([
    ['white', 'bg-white'],
    ['navy', 'bg-primary'],
    ['plum', 'bg-plum'],
    ['sage', 'bg-sage'],
    ['photo', 'bg-primary'],
  ] as const)('renders the %s variant with r8 p16', (variant, cls) => {
    render(
      <Card testID="card" variant={variant}>
        <Text>Body</Text>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card.props.className).toContain(cls);
    expect(card.props.className).toContain('rounded-lg');
    expect(card.props.className).toContain('p-4');
    expect(screen.getByText('Body')).toBeOnTheScreen();
  });

  it('can drop its padding', () => {
    render(<Card testID="card" noPadding />);
    expect(screen.getByTestId('card').props.className).not.toContain('p-4');
  });
});
