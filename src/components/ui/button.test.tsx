import * as React from 'react';
import { Text } from 'react-native';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { Button } from './button';

afterEach(cleanup);

describe('button component ', () => {
  it('should render correctly ', () => {
    render(<Button testID="button" />);
    expect(screen.getByTestId('button')).toBeOnTheScreen();
  });
  it('should render correctly if we add explicit child ', () => {
    render(
      <Button testID="button">
        <Text> Custom child </Text>
      </Button>,
    );
    expect(screen.getByText('Custom child')).toBeOnTheScreen();
  });
  it('should render the label correctly', () => {
    render(<Button testID="button" label="Submit" />);
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    expect(screen.getByText('Submit')).toBeOnTheScreen();
  });
  it('should render the loading indicator correctly', () => {
    render(<Button testID="button" loading={true} />);
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    expect(screen.getByTestId('button-activity-indicator')).toBeOnTheScreen();
  });
  it('should call onClick handler when clicked', async () => {
    const onClick = jest.fn();
    const { user } = setup(
      <Button testID="button" label="Click the button" onPress={onClick} />,
    );
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    await user.press(screen.getByTestId('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('should be disabled when loading', async () => {
    const onClick = jest.fn();
    const { user } = setup(
      <Button
        testID="button"
        loading={true}
        label="Click the button"
        onPress={onClick}
      />,
    );
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    expect(screen.getByTestId('button-activity-indicator')).toBeOnTheScreen();
    expect(screen.getByTestId('button')).toBeDisabled();
    await user.press(screen.getByTestId('button'));
    expect(onClick).toHaveBeenCalledTimes(0);
  });
  it('should be disabled when disabled prop is true', () => {
    render(<Button testID="button" disabled={true} />);
    expect(screen.getByTestId('button')).toBeDisabled();
  });
  it('shouldn\'t call onClick when disabled', async () => {
    const onClick = jest.fn();
    const { user } = setup(
      <Button
        testID="button"
        label="Click the button"
        disabled={true}
        onPress={onClick}
        variant="secondary"
      />,
    );
    expect(screen.getByTestId('button')).toBeOnTheScreen();
    await user.press(screen.getByTestId('button'));

    expect(screen.getByTestId('button')).toBeDisabled();

    expect(onClick).toHaveBeenCalledTimes(0);
  });
});

describe('button v2 variants', () => {
  it('uses the title ramp for large buttons and SemiBold 12 for M/S', () => {
    render(
      <>
        <Button testID="lg" size="lg" label="Large" />
        <Button testID="md" size="md" label="Medium" />
      </>,
    );
    expect(screen.getByTestId('lg-label')).toHaveStyle({ fontSize: 16 });
    expect(screen.getByTestId('md-label')).toHaveStyle({ fontSize: 12 });
    expect(screen.getByTestId('md-label').props.className).toContain('font-sans-semibold');
  });
  it.each([
    ['primary', 'bg-primary', 'text-on-primary'],
    ['secondary', 'border-primary', 'text-ink'],
    ['accent', 'bg-primary-fixed', 'text-plum'],
    ['on-dark', 'bg-white', 'text-ink'],
    ['ghost-on-dark', 'border-white', 'text-white'],
    ['destructive', 'bg-plum', 'text-on-primary'],
  ] as const)('styles the %s variant', (variant, container, label) => {
    render(<Button testID="button" variant={variant} label="Go" />);
    expect(screen.getByTestId('button').props.className).toContain(container);
    expect(screen.getByTestId('button-label').props.className).toContain(label);
  });
  it('keeps legacy variant names working', () => {
    render(
      <>
        <Button testID="a" variant="default" label="A" />
        <Button testID="b" variant="outline" label="B" />
      </>,
    );
    expect(screen.getByTestId('a').props.className).toContain('bg-primary');
    expect(screen.getByTestId('b').props.className).toContain('border-primary');
  });
  it('exposes button role, label and busy state', () => {
    render(<Button testID="button" label="Save" loading />);
    const btn = screen.getByTestId('button');
    expect(btn.props.accessibilityRole).toBe('button');
    expect(btn.props.accessibilityLabel).toBe('Save');
    expect(btn.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
  });
  it('pads small buttons to a 44pt hit target', () => {
    render(<Button testID="button" size="sm" label="Small" />);
    expect(screen.getByTestId('button').props.hitSlop).toEqual({ top: 9, bottom: 9 });
  });
  it('dims when disabled', () => {
    render(<Button testID="button" label="Submit" disabled />);
    expect(screen.getByTestId('button').props.className).toContain('opacity-40');
  });
});
