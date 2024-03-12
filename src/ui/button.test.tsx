/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, fireEvent, render, screen, waitFor } from '@/core/test-utils';

import { Button } from './button';

afterEach(cleanup);

describe('Button component ', () => {
  it('should render correctly ', () => {
    render(<Button testID="test-button" />);
    expect(screen.queryByTestId('test-button')).not.toBeNull();
  });
  it('should render the label correctly', () => {
    render(<Button testID="test-button" label="Submit" />);
    expect(screen.queryByTestId('test-button')).not.toBeNull();
    expect(screen.queryByTestId('test-button-label')).not.toBeNull();
    expect(screen.queryByText('Submit')).toBeTruthy();
  });
  it('should render the loading indicator correctly', () => {
    render(<Button testID="test-button" loading={true} />);
    expect(screen.queryByTestId('test-button')).not.toBeNull();
    expect(screen.getByTestId('test-button-activity-indicator')).not.toBeNull();
  });
  it('should call onClick handler when clicked', async () => {
    const onClick = jest.fn();
    render(
      <Button testID="test-button" label="Click the button" onPress={onClick} />
    );
    expect(screen.queryByTestId('test-button')).not.toBeNull();
    fireEvent.press(screen.getByTestId('test-button'));
    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
  });
  it('should be disabled when loading', () => {
    const onClick = jest.fn();
    render(
      <Button
        testID="test-button"
        loading={true}
        label="Click the button"
        onPress={onClick}
      />
    );
    expect(screen.queryByTestId('test-button')).not.toBeNull();
    expect(screen.getByTestId('test-button-activity-indicator')).not.toBeNull();
    expect(
      screen.getByTestId('test-button').props.accessibilityState.disabled
    ).toBe(true);
    fireEvent.press(screen.getByTestId('test-button'));
    expect(onClick).toHaveBeenCalledTimes(0);
  });
  it('should be disabled when disabled prop is true', () => {
    render(<Button testID="test-button" disabled={true} />);
    expect(
      screen.getByTestId('test-button').props.accessibilityState.disabled
    ).toBe(true);
  });
  it("shouldn't call onClick when disabled", () => {
    const onClick = jest.fn();
    render(
      <Button
        testID="test-button"
        label="Click the button"
        disabled={true}
        onPress={onClick}
        variant="secondary"
      />
    );
    expect(screen.queryByTestId('test-button')).not.toBeNull();
    fireEvent.press(screen.getByTestId('test-button'));
    expect(
      screen.getByTestId('test-button').props.accessibilityState.disabled
    ).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(0);
  });
  it('should apply correct styles based on size prop', () => {
    render(<Button testID="test-button" size="lg" />);
    const button = screen.getByTestId('test-button');

    const expectedStyle = 'font-[600] font-jakarta text-white text-xl';
    const receivedStyle =
      button.props.children[0].props.children.props.className;
    expect(receivedStyle).toContain(expectedStyle);
  });
  it('should apply correct styles for label when variant is secondary', () => {
    render(<Button testID="test-button" variant="secondary" label="Submit" />);
    const button = screen.getByTestId('test-button');

    const expectedStyle =
      'font-[600] font-jakarta text-secondary-600 text-base';
    const receivedStyle =
      button.props.children[0].props.children.props.className;
    expect(receivedStyle).toContain(expectedStyle);
  });
  it('should apply correct styles for label when is disabled', () => {
    render(<Button testID="test-button" label="Submit" disabled />);
    const button = screen.getByTestId('test-button');

    const expectedStyle = 'font-[600] font-jakarta text-base text-neutral-600';
    const receivedStyle =
      button.props.children[0].props.children.props.className;
    expect(receivedStyle).toContain(expectedStyle);
  });
});
