/* eslint-disable max-lines-per-function */
import React from 'react';

import { cleanup, fireEvent, render, screen, waitFor } from '@/core/test-utils';
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
    render(
      <Select
        label="Select options"
        options={options}
        onSelect={onSelect}
        testID="test-select"
      />
    );
    expect(screen.queryByTestId('test-select-trigger')).not.toBeNull();
    expect(screen.queryByTestId('test-select-label')).not.toBeNull();
  });

  it('should render the label correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="test-select"
      />
    );
    expect(screen.queryByTestId('test-select-trigger')).not.toBeNull();
    expect(screen.queryByTestId('test-select-label')).not.toBeNull();
    expect(screen.queryByTestId('test-select-label')?.props.children).toBe(
      'Select'
    );
  });

  it('should render the error correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="test-select"
        error="Please select an option"
      />
    );
    expect(screen.queryByTestId('test-select-trigger')).not.toBeNull();
    expect(screen.queryByTestId('test-select-error')).not.toBeNull();
    expect(screen.queryByTestId('test-select-error')?.props.children).toBe(
      'Please select an option'
    );
  });

  it('should open options modal on press', async () => {
    render(
      <Select
        label="Select"
        options={options}
        testID="test-select"
        placeholder="Select an option"
      />
    );

    const selectTrigger = screen.getByTestId('test-select-trigger');
    fireEvent.press(selectTrigger);

    await waitFor(() => {
      expect(screen.getByTestId('test-select-item-chocolate')).not.toBeNull();
      expect(screen.getByTestId('test-select-item-strawberry')).not.toBeNull();
      expect(screen.getByTestId('test-select-item-vanilla')).not.toBeNull();
    });
  });

  it('should call onSelect on selecting an option', async () => {
    const onSelect = jest.fn();

    render(
      <Select options={options} onSelect={onSelect} testID="test-select" />
    );

    const optionModal = screen.getByTestId('test-select-modal');
    fireEvent(optionModal, 'onPresent');

    const optionItem1 = screen.getByTestId('test-select-item-chocolate');
    fireEvent.press(optionItem1);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(options[0].value);
    });
  });
});
