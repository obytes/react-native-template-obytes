/* eslint-disable max-lines-per-function */
import 'react-native';

import React from 'react';

import { cleanup, fireEvent, render } from '@/core/test-utils';

import { Checkbox, Radio, Switch } from './checkbox';

afterEach(cleanup);

describe('Checkbox, Radio & Switch components ', () => {
  it('<Checkbox /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('checkbox')).not.toBeNull();
    expect(queryByTestId('checkbox-label')).toBeNull();
    expect(getByTestId('checkbox').props.accessibilityState.checked).toBe(
      false
    );
    expect(getByTestId('checkbox').props.accessibilityRole).toBe('checkbox');
    expect(getByTestId('checkbox').props.accessibilityLabel).toBe('agree');

    fireEvent.press(getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<CheckBox/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('checkbox')).not.toBeNull();

    fireEvent.press(getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  it('<CheckBox/> Should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
        label="I agree to terms and conditions"
      />
    );
    expect(queryByTestId('checkbox')).not.toBeNull();
    expect(queryByTestId('checkbox-label')).not.toBeNull();
    expect(getByTestId('checkbox').props.accessibilityState.checked).toBe(
      false
    );
    expect(getByTestId('checkbox').props.accessibilityRole).toBe('checkbox');
    expect(getByTestId('checkbox').props.accessibilityLabel).toBe('agree');

    expect(queryByTestId('checkbox-label')?.props.children).toBe(
      'I agree to terms and conditions'
    );
    fireEvent.press(getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Radio /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('radio')).not.toBeNull();
    expect(queryByTestId('radio-label')).toBeNull();

    expect(getByTestId('radio').props.accessibilityState.checked).toBe(false);
    expect(getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Radio /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label="I agree to terms and conditions"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('radio')).not.toBeNull();
    expect(queryByTestId('radio-label')).not.toBeNull();
    expect(queryByTestId('radio-label')?.props.children).toBe(
      'I agree to terms and conditions'
    );

    expect(getByTestId('radio').props.accessibilityState.checked).toBe(false);
    expect(getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(getByTestId('radio-label'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Radio/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Radio
        disabled={true}
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('radio')).not.toBeNull();

    fireEvent.press(getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Switch /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('switch')).not.toBeNull();
    expect(queryByTestId('switch-label')).toBeNull();

    expect(getByTestId('switch').props.accessibilityState.checked).toBe(false);
    expect(getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Switch /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label="I agree to terms and conditions"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('switch')).not.toBeNull();
    expect(queryByTestId('switch-label')).not.toBeNull();
    expect(queryByTestId('switch-label')?.props.children).toBe(
      'I agree to terms and conditions'
    );
    expect(getByTestId('switch').props.accessibilityState.checked).toBe(false);
    expect(getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(getByTestId('switch-label'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Switch/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { queryByTestId, getByTestId } = render(
      <Switch
        disabled={true}
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(queryByTestId('switch')).not.toBeNull();
    fireEvent.press(getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
});
