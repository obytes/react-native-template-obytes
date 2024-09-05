/* eslint-disable max-lines-per-function */
import 'react-native';

import { cleanup, fireEvent, render, screen } from '@/core/test-utils';

import { Checkbox, Radio, Switch } from './checkbox';

afterEach(cleanup);

describe('Checkbox, Radio & Switch components ', () => {
  const CHECKBOX_LABEL = 'checkbox-label';
  const AGREE_TERMS = 'I agree to terms and conditions';
  const RADIO_LABEL = 'radio-label';
  const SWITCH_LABEL = 'switch-label';
  it('<Checkbox /> renders correctly and call on change on Press', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.queryByTestId(CHECKBOX_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('checkbox')).toBeEnabled();

    expect(screen.getByTestId('checkbox')).not.toBeChecked();
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

  it("<CheckBox/> shouldn't change value while disabled", () => {
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
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId('checkbox')).toBeDisabled();
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  it('<CheckBox/> Should render the correct label', () => {
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
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId(CHECKBOX_LABEL)).toBeOnTheScreen();
    expect(
      screen.getByTestId('checkbox').props.accessibilityState.checked
    ).toBe(false);
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox'
    );

    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree'
    );
    expect(screen.getByTestId(CHECKBOX_LABEL)).toHaveTextContent(AGREE_TERMS);
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Radio /> renders correctly and call on change on Press', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.queryByTestId(RADIO_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('radio')).toBeEnabled();
    expect(screen.getByTestId('radio')).not.toBeChecked();
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Radio /> should render the correct label', () => {
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
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.getByTestId(RADIO_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(RADIO_LABEL)).toHaveTextContent(AGREE_TERMS);

    expect(screen.getByTestId('radio').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId(RADIO_LABEL));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Radio/> shouldn't change value while disabled", () => {
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
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.getByTestId('radio')).toBeDisabled();
    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Switch /> renders correctly and call on change on Press', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    expect(screen.queryByTestId(SWITCH_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('switch')).toBeEnabled();
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Switch /> should render the correct label', () => {
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
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    expect(screen.getByTestId(SWITCH_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(SWITCH_LABEL)).toHaveTextContent(AGREE_TERMS);
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId(SWITCH_LABEL));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Switch/> shouldn't change value while disabled", () => {
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
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
});
