/* eslint-disable max-lines-per-function */
import 'react-native';

import React from 'react';

import { cleanup, fireEvent, render, screen } from '@/core/test-utils';

import { Checkbox, Radio, Switch } from './checkbox';

afterEach(cleanup);

describe('Checkbox, Radio & Switch components ', () => {
  it('<Checkbox /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('checkbox')).not.toBeNull();
    expect(screen.queryByTestId('checkbox-label')).toBeNull();
    expect(
      screen.getByTestId('checkbox').props.accessibilityState.checked
    ).toBe(false);
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox'
    );
    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree'
    );

    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<CheckBox/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('checkbox')).not.toBeNull();

    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  it('<CheckBox/> Should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
        label="I agree to terms and conditions"
      />
    );
    expect(screen.queryByTestId('checkbox')).not.toBeNull();
    expect(screen.queryByTestId('checkbox-label')).not.toBeNull();
    expect(
      screen.getByTestId('checkbox').props.accessibilityState.checked
    ).toBe(false);
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox'
    );
    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree'
    );

    expect(screen.queryByTestId('checkbox-label')?.props.children).toBe(
      'I agree to terms and conditions'
    );
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Radio /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('radio')).not.toBeNull();
    expect(screen.queryByTestId('radio-label')).toBeNull();

    expect(screen.getByTestId('radio').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Radio /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label="I agree to terms and conditions"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('radio')).not.toBeNull();
    expect(screen.queryByTestId('radio-label')).not.toBeNull();
    expect(screen.queryByTestId('radio-label')?.props.children).toBe(
      'I agree to terms and conditions'
    );

    expect(screen.getByTestId('radio').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId('radio-label'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Radio/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Radio
        disabled={true}
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('radio')).not.toBeNull();

    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Switch /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('switch')).not.toBeNull();
    expect(screen.queryByTestId('switch-label')).toBeNull();

    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Switch /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label="I agree to terms and conditions"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('switch')).not.toBeNull();
    expect(screen.queryByTestId('switch-label')).not.toBeNull();
    expect(screen.queryByTestId('switch-label')?.props.children).toBe(
      'I agree to terms and conditions'
    );
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId('switch-label'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Switch/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        disabled={true}
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.queryByTestId('switch')).not.toBeNull();
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
});
