import React from 'react';
import { Pressable, Text } from 'react-native';

import { cleanup, fireEvent, render, screen } from '@/core/test-utils';

import { Modal, useModal } from './modal';

const TestComponent = () => {
  const modal = useModal();

  return (
    <>
      <Pressable testID="open-modal-button" onPress={modal.present}>
        <Text>Press</Text>
      </Pressable>
      <Modal index={0} ref={modal.ref} title="Modal title" testID="test-modal">
        <Pressable testID="modal-content" onPress={modal.dismiss}>
          <Text>Modal Content</Text>
        </Pressable>
      </Modal>
    </>
  );
};
afterEach(cleanup);

describe('Modal component', () => {
  it('should render correctly', async () => {
    render(<TestComponent />);

    const openModalButton = screen.getByTestId('open-modal-button');
    fireEvent.press(openModalButton);

    expect(screen.getByText('Modal Content')).toBeTruthy();
  });
});
