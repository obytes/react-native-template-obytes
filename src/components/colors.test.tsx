import { render, screen, within } from '@testing-library/react-native';

import { colors } from '@/ui';

import { Colors } from './colors';

describe('Colors component', () => {
  it('should render the Title component', () => {
    render(<Colors />);
    expect(screen.getByText('Colors')).toBeTruthy();
  });

  it('should render Color components for each color group', () => {
    render(<Colors />);
    const colorNames = Object.keys(colors) as (keyof typeof colors)[];

    colorNames.forEach((name: keyof typeof colors) => {
      if (typeof colors[name] !== 'string') {
        const colorTextLabel = screen.getByText(name.toUpperCase());
        expect(colorTextLabel).toBeTruthy();
        const list = screen.getByTestId(`color-list-${name}`);

        Object.entries(colors[name]).forEach(([color]) => {
          within(list).getByText(color);
        });
      }
    });
  });
});
