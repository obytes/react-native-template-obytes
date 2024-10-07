/* eslint-disable max-lines-per-function */

import React from 'react';

import { cleanup, render, screen, setup } from '@/core/test-utils';
import type { OptionType } from '@/ui';

import { Select } from './select';

afterEach(cleanup);

describe('Select component ', () => {
  const options: OptionType[] = [
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
        testID="select"
      />,
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toBeOnTheScreen();
  });

  it('should render the label correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
      />,
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toBeOnTheScreen();
    expect(screen.getByTestId('select-label')).toHaveTextContent('Select');
  });

  it('should render the error correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
        error="Please select an option"
      />,
    );
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-error')).toBeOnTheScreen();
    expect(screen.getByTestId('select-error')).toHaveTextContent(
      'Please select an option',
    );
  });

  it('should open options modal on press', async () => {
    const { user } = setup(
      <Select
        label="Select"
        options={options}
        testID="select"
        placeholder="Select an option"
      />,
    );

    const selectTrigger = screen.getByTestId('select-trigger');
    await user.press(selectTrigger);

    expect(screen.getByTestId('select-item-chocolate')).toBeOnTheScreen();
    expect(screen.getByTestId('select-item-strawberry')).toBeOnTheScreen();
    expect(screen.getByTestId('select-item-vanilla')).toBeOnTheScreen();
  });

  it('should call onSelect on selecting an option', async () => {
    const onSelect = jest.fn();

    const { user } = setup(
      <Select options={options} onSelect={onSelect} testID="select" />,
    );

    const selectTrigger = screen.getByTestId('select-trigger');
    await user.press(selectTrigger);

    const optionModal = screen.getByTestId('select-modal');
    await user.press(optionModal);

    const optionItem1 = screen.getByTestId('select-item-chocolate');
    await user.press(optionItem1);

    expect(onSelect).toHaveBeenCalledWith(options[0].value);
  });
});
