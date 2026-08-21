import type { Href } from 'expo-router';
import type { LoginFormProps } from './components/login-form';
import { useSignIn } from '@clerk/expo';
import { useRouter } from 'expo-router';

import * as React from 'react';
import { FocusAwareStatusBar, showErrorMessage } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { LoginForm } from './components/login-form';

export function LoginScreen() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const onSubmit: LoginFormProps['onSubmit'] = React.useCallback(
    async (data: { email: string; password: string }) => {
      // The future sign-in API resolves with { error } instead of throwing,
      // so a try/catch here would never see a failed sign-in.
      const { error } = await signIn.password({
        emailAddress: data.email,
        password: data.password,
      });

      if (error) {
        showErrorMessage(translate('login.failed'));
        return;
      }

      // Without finalize() the status reaches 'complete' but no session is
      // ever activated, leaving the route guard to bounce back to /login.
      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            router.replace(decorateUrl('/') as Href);
          },
        });
      }
    },
    [signIn, router],
  );

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}
