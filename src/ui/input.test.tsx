import React from 'react';

import { cleanup, fireEvent, render } from '@/core/test-utils';

import { Input } from './input';

afterEach(cleanup);

describe('Input component ', () => {
  it('renders correctly ', () => {
    const { getByTestId } = render(<Input />);
    const input = getByTestId('NTextInput');
    expect(input).toBeTruthy();
  });

  it('should render the label correctly ', () => {
    const label = 'Username';
    const { getByText, getByTestId } = render(<Input label={label} />);

    const labelElement = getByTestId('input-label');
    expect(labelElement).toBeTruthy(); // Check if label element is found
    expect(getByText(label)).toBeTruthy(); // Check if label text is found
  });

  it('should render the error message correctly ', () => {
    const error = 'This is a message error';
    const { getByTestId, getByText } = render(<Input error={error} />);

    const errorElement = getByTestId('input-error');
    expect(errorElement).toBeTruthy(); // Check if error element is found
    expect(getByText(error)).toBeTruthy(); // Check if error message text is found
  });

  it('should trigger onFocus event correctly ', () => {
    const onFocus = jest.fn();
    const { getByTestId } = render(<Input onFocus={onFocus} />);

    const input = getByTestId('NTextInput');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('should trigger onBlur event correctly ', () => {
    const onBlur = jest.fn();
    const { getByTestId } = render(<Input onBlur={onBlur} />);

    const input = getByTestId('NTextInput');
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
