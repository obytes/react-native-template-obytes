/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, fireEvent, render, screen } from '@/core/test-utils';

import { Input } from './input';

afterEach(cleanup);

describe('Input component ', () => {
  it('renders correctly ', () => {
    render(<Input testID="text-input" />);
    const input = screen.getByTestId('text-input');
    expect(input).toBeOnTheScreen();
    expect(screen.getByTestId('text-input')).toBeOnTheScreen();
  });

  it('should render the placeholder correctly ', () => {
    render(<Input testID="text-input" placeholder="Enter your username" />);
    expect(screen.getByTestId('text-input')).toBeOnTheScreen();
    expect(
      screen.getByPlaceholderText('Enter your username')
    ).toBeOnTheScreen();
  });

  it('should render the label correctly ', () => {
    render(<Input testID="text-input" label="Username" />);
    expect(screen.getByTestId('text-input')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-label')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-label')?.props.children).toBe(
      'Username'
    );
  });

  it('should render the error message correctly ', () => {
    render(<Input testID="text-input" error="This is an error message" />);
    expect(screen.getByTestId('text-input')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-error')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-error')?.props.children).toBe(
      'This is an error message'
    );
  });
  it('should render the label, error message & placeholder correctly ', () => {
    render(
      <Input
        testID="text-input"
        label="Username"
        placeholder="Enter your username"
        error="This is an error message"
      />
    );
    expect(screen.getByTestId('text-input')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-label')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-label')?.props.children).toBe(
      'Username'
    );
    expect(screen.getByTestId('text-input-error')).toBeOnTheScreen();
    expect(screen.getByTestId('text-input-error')?.props.children).toBe(
      'This is an error message'
    );
    expect(
      screen.getByPlaceholderText('Enter your username')
    ).toBeOnTheScreen();
  });

  it('should trigger onFocus event correctly ', () => {
    const onFocus = jest.fn();
    render(<Input onFocus={onFocus} />);

    const input = screen.getByTestId('input');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event correctly ', () => {
    const onBlur = jest.fn();
    render(<Input onBlur={onBlur} />);

    const input = screen.getByTestId('input');
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
  it('should trigger onChangeText event correctly', () => {
    const onChangeText = jest.fn();
    render(<Input onChangeText={onChangeText} />);

    const input = screen.getByTestId('input');
    fireEvent.changeText(input, 'test text');
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('test text');
  });
  it('should be disabled when disabled prop is true', () => {
    render(<Input testID="text-input" disabled={true} />);

    const input = screen.getByTestId('text-input');
    expect(input.props.disabled).toBe(true);
  });
});
