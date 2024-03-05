/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, fireEvent, render, waitFor } from '@/core/test-utils';
import type { Option } from '@/ui';

import { Select } from './select';

afterEach(cleanup);

describe('Select component ', () => {
  const options: Option[] = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  it('should render correctly ', () => {
    const onSelect = jest.fn();
    const { queryByTestId } = render(
      <Select
        label="Select options"
        options={options}
        onSelect={onSelect}
        testID="test-select"
      />
    );
    expect(queryByTestId('test-select')).not.toBeNull();
    expect(queryByTestId('test-select-label')).not.toBeNull();
  });

  it('should render the label correctly ', () => {
    const onSelect = jest.fn();
    const { queryByTestId } = render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="test-select"
      />
    );
    expect(queryByTestId('test-select')).not.toBeNull();
    expect(queryByTestId('test-select-label')).not.toBeNull();
    expect(queryByTestId('test-select-label')?.props.children).toBe('Select');
  });

  it('should render the error correctly ', () => {
    const onSelect = jest.fn();
    const { queryByTestId } = render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="test-select"
        error="Please select an option"
      />
    );
    expect(queryByTestId('test-select')).not.toBeNull();
    expect(queryByTestId('test-select-error')).not.toBeNull();
    expect(queryByTestId('test-select-error')?.props.children).toBe(
      'Please select an option'
    );
  });

  it('should open options modal on press', async () => {
    const { getByTestId } = render(
      <Select
        label="Select"
        options={options}
        testID="test-select"
        placeholder="Select an option"
      />
    );

    const selectComponent = getByTestId('test-select');
    fireEvent.press(selectComponent);

    await waitFor(() => {
      expect(getByTestId('test-select-item-chocolate')).not.toBeNull();
      expect(getByTestId('test-select-item-strawberry')).not.toBeNull();
      expect(getByTestId('test-select-item-vanilla')).not.toBeNull();
    });
  });

  it('should call onSelect on selecting an option', async () => {
    const onSelect = jest.fn();

    const { getByTestId } = render(
      <Select options={options} onSelect={onSelect} testID="test-select" />
    );

    const optionModal = getByTestId('test-select-modal');
    fireEvent(optionModal, 'onPresent');

    const optionItem1 = getByTestId('test-select-item-chocolate');
    fireEvent.press(optionItem1);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(options[0].value);
    });
  });
});
