import type { AuthUser } from '@/lib/auth/utils';
import { useRouter } from 'expo-router';

import * as React from 'react';

import { FocusAwareStatusBar, ScreenBackground, View } from '@/components/ui';
import { WelcomeLoader } from '@/features/arrival/welcome-loader';
import { bootstrapMobileOrganization } from '@/lib/auth/mobile-org-bootstrap';
import { removeToken, removeUser, setToken, setUser } from '@/lib/auth/utils';
import { LoginForm } from './components/login-form';
import { useAuthStore } from './use-auth-store';

export function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore.use.signIn();
  const [welcome, setWelcome] = React.useState<{ name?: string } | null>(null);

  const onSuccess = async (data: { token: string; user: AuthUser }) => {
    // Token first so verify can send Bearer. Delay signIn status until after
    // bootstrap — that status starts push permission + Circle prewarm.
    setToken(data.token);
    setUser(data.user);
    try {
      await bootstrapMobileOrganization({ verifyMembership: true });
      signIn(data.token, data.user);
      // Hand off to Home once the welcome loader has shown for its minimum time.
      setWelcome({ name: data.user.name });
    }
    catch (error) {
      removeToken();
      removeUser();
      throw error;
    }
  };

  if (welcome) {
    return <WelcomeLoader name={welcome.name} onReady={() => router.replace('/')} />;
  }

  return (
    <View className="flex-1">
      <FocusAwareStatusBar barStyle="light" />
      <ScreenBackground variant="welcome-navy" />
      <LoginForm onSuccess={onSuccess} />
    </View>
  );
}
