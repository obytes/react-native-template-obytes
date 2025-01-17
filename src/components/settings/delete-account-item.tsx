import React from 'react';
import { Alert } from 'react-native';

import { translate } from '@/core';

import { Item } from './item';

export type DeleteAccountItemProps = {
  onDelete: () => void;
};

export const DeleteAccountItem = (props: DeleteAccountItemProps) => {
  const handleDeleteAccount = () => {
    props.onDelete();
  };

  const confirmDelete = () => {
    Alert.alert(
      translate('settings.deleteAccount.confirmTitle'),
      translate('settings.deleteAccount.confirmMessage'),
      [
        { text: translate('settings.deleteAccount.cancel'), style: 'cancel' },
        {
          text: translate('settings.deleteAccount.delete'),
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ],
    );
  };

  return <Item text={'settings.deleteAccount.title'} onPress={confirmDelete} />;
};
