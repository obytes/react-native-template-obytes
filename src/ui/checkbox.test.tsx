/* eslint-disable max-lines-per-function */
import 'react-native';

import { cleanup, fireEvent, render, screen, setup } from '@/core/test-utils';

import { Checkbox, Radio, Switch } from './checkbox';

afterEach(cleanup);

const AGREE_TERMS = 'I agree to terms and conditions';

describe('Checkbox component', () => {
  const CHECKBOX_LABEL = 'checkbox-label';

  it('<Checkbox /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.queryByTestId(CHECKBOX_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('checkbox')).toBeEnabled();

    expect(screen.getByTestId('checkbox')).not.toBeChecked();
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox',
    );
    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree',
    );

    await user.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<CheckBox/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId('checkbox')).toBeDisabled();
    await user.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  it('<CheckBox/> Should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
        label={AGREE_TERMS}
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId(CHECKBOX_LABEL)).toBeOnTheScreen();
    expect(
      screen.getByTestId('checkbox').props.accessibilityState.checked,
    ).toBe(false);
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox',
    );

    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree',
    );
    expect(screen.getByTestId(CHECKBOX_LABEL)).toHaveTextContent(AGREE_TERMS);
    await user.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Checkbox /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        testID="checkbox"
        label=""
        onChange={mockOnChange}
        accessibilityLabel="agree"
      />,
    );
    expect(screen.queryByTestId(CHECKBOX_LABEL)).not.toBeOnTheScreen();
  });

  it('<Checkbox /> renders as checked when checked prop is true', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        checked={true}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeChecked();
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Checkbox should toggle to unchecked
  });
});

describe('Radio component ', () => {
  const RADIO_LABEL = 'radio-label';

  it('<Radio /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.queryByTestId(RADIO_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('radio')).toBeEnabled();
    expect(screen.getByTestId('radio')).not.toBeChecked();
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    await user.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Radio /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label={AGREE_TERMS}
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.getByTestId(RADIO_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(RADIO_LABEL)).toHaveTextContent(AGREE_TERMS);

    expect(screen.getByTestId('radio').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    await user.press(screen.getByTestId(RADIO_LABEL));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Radio/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Radio
        disabled={true}
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.getByTestId('radio')).toBeDisabled();
    await user.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
});

describe('Switch component ', () => {
  const SWITCH_LABEL = 'switch-label';

  it('<Switch /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    expect(screen.queryByTestId(SWITCH_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('switch')).toBeEnabled();
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    await user.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Switch /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label={AGREE_TERMS}
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    expect(screen.getByTestId(SWITCH_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(SWITCH_LABEL)).toHaveTextContent(AGREE_TERMS);
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    await user.press(screen.getByTestId(SWITCH_LABEL));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Switch/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Switch
        disabled={true}
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    await user.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Switch /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        label=""
        onChange={mockOnChange}
        accessibilityLabel="agree"
      />,
    );
    expect(screen.queryByTestId(SWITCH_LABEL)).not.toBeOnTheScreen();
  });

  it('<Switch /> renders as checked when checked prop is true', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        checked={true}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      true,
    );
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Switch should toggle to unchecked
  });
});
