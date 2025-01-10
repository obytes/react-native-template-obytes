import React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';

import { useForgotPassword } from '@/api/auth/use-forgot-password';
import {
  ForgotPasswordForm,
  type FormType as ForgotPasswordFormType,
} from '@/components/forgot-password-form';
import { FocusAwareStatusBar } from '@/ui';

export default function ForgotPassword() {
  const { t } = useTranslation();

  const { mutate: sendForgotPasswordInstructions } = useForgotPassword({
    onSuccess: () => {
      showMessage({
        message: t('forgotPassword.successMessage'),
        type: 'success',
      });
    },
    onError: () => {
      showMessage({
        message: t('forgotPassword.errorMessage'),
        type: 'danger',
      });
    },
  });

  const onSubmit = (data: ForgotPasswordFormType) => {
    sendForgotPasswordInstructions(data);
  };
  return (
    <>
      <FocusAwareStatusBar />
      <ForgotPasswordForm onSubmit={onSubmit} />
    </>
  );
}
