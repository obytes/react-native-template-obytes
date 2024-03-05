import React from 'react';

import { cleanup, fireEvent, render, waitFor } from '@/core/test-utils';

import { Button } from './button';

afterEach(cleanup);

describe('Button component ', () => {
  it('should render correctly ', () => {
    const { queryByTestId } = render(<Button testID="test-button" />);
    expect(queryByTestId('test-button')).not.toBeNull();
  });
  it('should render the label correctly', () => {
    const { queryByText, queryByTestId } = render(
      <Button testID="test-button" label="Submit" />
    );
    expect(queryByTestId('test-button')).not.toBeNull();
    expect(queryByTestId('test-button-label')).not.toBeNull();
    expect(queryByText('Submit')).toBeTruthy();
  });
  it('should render the loading indicator correctly', () => {
    const { getByTestId, queryByTestId } = render(
      <Button testID="test-button" loading={true} />
    );
    expect(queryByTestId('test-button')).not.toBeNull();
    expect(getByTestId('test-button-activity-indicator')).not.toBeNull();
  });
  it('should call onClick handler when clicked', async () => {
    const onClick = jest.fn();
    const { queryByTestId, getByTestId } = render(
      <Button testID="test-button" label="Click the button" onPress={onClick} />
    );
    expect(queryByTestId('test-button')).not.toBeNull();
    fireEvent.press(getByTestId('test-button'));
    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
  });
  it('should be disabled when loading', () => {
    const onClick = jest.fn();
    const { queryByTestId, getByTestId } = render(
      <Button
        testID="test-button"
        loading={true}
        label="Click the button"
        onPress={onClick}
      />
    );
    expect(queryByTestId('test-button')).not.toBeNull();
    expect(getByTestId('test-button-activity-indicator')).not.toBeNull();
    expect(getByTestId('test-button').props.accessibilityState.disabled).toBe(
      true
    );
    fireEvent.press(getByTestId('test-button'));
    expect(onClick).toHaveBeenCalledTimes(0);
  });
  it("shouldn't call onClick when disabled", () => {
    const onClick = jest.fn();
    const { queryByTestId, getByTestId } = render(
      <Button
        testID="test-button"
        label="Click the button"
        disabled={true}
        onPress={onClick}
        variant="secondary"
      />
    );
    expect(queryByTestId('test-button')).not.toBeNull();
    fireEvent.press(getByTestId('test-button'));
    expect(getByTestId('test-button').props.accessibilityState.disabled).toBe(
      true
    );
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
