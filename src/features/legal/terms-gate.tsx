import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuthStore } from '@/features/auth/use-auth-store';

import { AcceptTermsScreen } from './accept-terms-screen';
import { useAcceptTerms, useLegalStatus } from './api';

/**
 * Covers the whole app with the accept-terms prompt while a signed-in member
 * still needs to accept the current terms or confirm they are 18+. Rendered as
 * an overlay above the navigator so deep links (push, notification centre)
 * can't route around it, and navigation state survives acceptance.
 *
 * Fails open while loading or on a status error: the server-side checkout
 * guard and the web /accept-terms gate remain the backstop.
 */
export function TermsGate() {
  const status = useAuthStore.use.status();
  const user = useAuthStore.use.user();
  const userId = status === 'signIn' ? user?.id : undefined;

  const legalStatus = useLegalStatus(userId);
  const accept = useAcceptTerms(userId);

  if (!userId || !legalStatus.data?.needsAcceptance) {
    return null;
  }

  const { currentVersion } = legalStatus.data;

  return (
    <View style={StyleSheet.absoluteFill}>
      <AcceptTermsScreen
        onAccept={() => accept.mutate(currentVersion)}
        isAccepting={accept.isPending}
        error={accept.isError ? 'We couldn\'t save your acceptance. Please try again.' : null}
      />
    </View>
  );
}
