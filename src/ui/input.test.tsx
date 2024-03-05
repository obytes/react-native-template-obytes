import React from 'react';

import { cleanup, fireEvent, render } from '@/core/test-utils';

import { Input } from './input';

afterEach(cleanup);

describe('Input component ', () => {
  it('renders correctly ', () => {
    const { queryByTestId } = render(<Input testID="text-input" />);
    expect(queryByTestId('text-input')).not.toBeNull();
  });

  it('should render the placeholder correctly ', () => {
    const { queryByTestId, getByPlaceholderText } = render(
      <Input testID="text-input" placeholder="Enter your username" />
    );
    expect(queryByTestId('text-input')).not.toBeNull();
    expect(getByPlaceholderText('Enter your username')).toBeDefined();
  });

  it('should render the label correctly ', () => {
    const { queryByTestId } = render(
      <Input testID="text-input" label="Username" />
    );
    expect(queryByTestId('text-input')).not.toBeNull();
    expect(queryByTestId('text-input-label')).not.toBeNull();
    expect(queryByTestId('text-input-label')?.props.children).toBe('Username');
  });

  it('should render the error message correctly ', () => {
    const { queryByTestId } = render(
      <Input testID="text-input" error="This is an error message" />
    );
    expect(queryByTestId('text-input')).not.toBeNull();
    expect(queryByTestId('text-input-error')).not.toBeNull();
    expect(queryByTestId('text-input-error')?.props.children).toBe(
      'This is an error message'
    );
  });
  it('should render the label, error message & placeholder correctly ', () => {
    const { queryByTestId, getByPlaceholderText } = render(
      <Input
        testID="text-input"
        label="Username"
        placeholder="Enter your username"
        error="This is an error message"
      />
    );
    expect(queryByTestId('text-input')).not.toBeNull();
    expect(queryByTestId('text-input-label')).not.toBeNull();
    expect(queryByTestId('text-input-label')?.props.children).toBe('Username');
    expect(queryByTestId('text-input-error')).not.toBeNull();
    expect(queryByTestId('text-input-error')?.props.children).toBe(
      'This is an error message'
    );
    expect(getByPlaceholderText('Enter your username')).toBeDefined();
  });

  it('should trigger onFocus event correctly ', () => {
    const onFocus = jest.fn();
    const { getByTestId } = render(<Input onFocus={onFocus} />);

    const input = getByTestId('input');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event correctly ', () => {
    const onBlur = jest.fn();
    const { getByTestId } = render(<Input onBlur={onBlur} />);

    const input = getByTestId('input');
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
