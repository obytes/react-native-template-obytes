/* eslint-disable max-lines-per-function */
import React from 'react';
import { I18nManager } from 'react-native';

import { cleanup, render, screen, setup } from '@/core/test-utils';

import { Input } from './input';

afterEach(cleanup);

describe('Input component ', () => {
  it('renders correctly ', () => {
    render(<Input testID="input" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();
  });
  it('should use the right direction for rtl layout', () => {
    I18nManager.isRTL = true;
    render(<Input testID="input" />);
    expect(screen.getByTestId('input')).toHaveStyle({
      writingDirection: 'rtl',
    });
  });

  it('should use the right direction for ltr layout', () => {
    I18nManager.isRTL = false;
    render(<Input testID="input" />);
    expect(screen.getByTestId('input')).toHaveStyle({
      writingDirection: 'ltr',
    });
  });

  it('should render the placeholder correctly ', () => {
    render(<Input testID="input" placeholder="Enter your username" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();
    expect(
      screen.getByPlaceholderText('Enter your username'),
    ).toBeOnTheScreen();
  });

  it('should render the label correctly ', () => {
    render(<Input testID="input" label="Username" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByTestId('input-label')).toHaveTextContent('Username');
  });

  it('should render the error message correctly ', () => {
    render(<Input testID="input" error="This is an error message" />);
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByTestId('input-error')).toHaveTextContent(
      'This is an error message',
    );
  });
  it('should render the label, error message & placeholder correctly ', () => {
    render(
      <Input
        testID="input"
        label="Username"
        placeholder="Enter your username"
        error="This is an error message"
      />,
    );
    expect(screen.getByTestId('input')).toBeOnTheScreen();

    expect(screen.getByTestId('input-label')).toHaveTextContent('Username');
    expect(screen.getByTestId('input-error')).toBeOnTheScreen();
    expect(screen.getByTestId('input-error')).toHaveTextContent(
      'This is an error message',
    );
    expect(
      screen.getByPlaceholderText('Enter your username'),
    ).toBeOnTheScreen();
  });

  it('should trigger onFocus event correctly ', async () => {
    const onFocus = jest.fn();
    const { user } = setup(<Input testID="input" onFocus={onFocus} />);

    const input = screen.getByTestId('input');
    await user.type(input, 'test text');
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event correctly ', async () => {
    const onBlur = jest.fn();
    const { user } = setup(<Input testID="input" onBlur={onBlur} />);

    const input = screen.getByTestId('input');
    await user.type(input, 'test text');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
  it('should trigger onChangeText event correctly', async () => {
    const onChangeText = jest.fn();
    const { user } = setup(
      <Input testID="input" onChangeText={onChangeText} />,
    );

    const input = screen.getByTestId('input');
    await user.type(input, '123456789');
    expect(onChangeText).toHaveBeenCalledTimes(9); // every character is a change event
    expect(onChangeText).toHaveBeenCalledWith('123456789');
  });
  it('should be disabled when disabled prop is true', () => {
    render(<Input testID="input" disabled={true} />);

    const input = screen.getByTestId('input');
    expect(input.props.disabled).toBe(true);
  });
});
