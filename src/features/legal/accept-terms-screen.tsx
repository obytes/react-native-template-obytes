import * as React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Checkbox, Text, View } from '@/components/ui';
import { signOut } from '@/features/auth/use-auth-store';
import { openExternalLink } from '@/lib/open-external-link';

const TERMS_URL = 'https://rionna.com/legal/terms';
const PRIVACY_URL = 'https://rionna.com/legal/privacy-policy';

type Props = {
  onAccept: () => void;
  isAccepting: boolean;
  error: string | null;
};

/**
 * Full-screen prompt shown over the app until the member confirms they are
 * 18+ and accepts the current Terms & Conditions (mirrors web /accept-terms).
 */
export function AcceptTermsScreen({ onAccept, isAccepting, error }: Props) {
  const insets = useSafeAreaInsets();
  const [over18, setOver18] = React.useState(false);
  const [acceptTerms, setAcceptTerms] = React.useState(false);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <Text className="mb-2 font-display text-3xl text-ink">
        Terms & Conditions
      </Text>
      <Text className="mb-6 text-ink-muted">
        Please confirm you are 18 or over and accept our Terms & Conditions to continue.
      </Text>

      {error && (
        <View className="mb-4 rounded-lg bg-danger-50 p-3">
          <Text className="text-center text-sm text-ink">{error}</Text>
        </View>
      )}

      <Checkbox
        testID="over18-checkbox"
        accessibilityLabel="I confirm I am 18 or over"
        label="I confirm I am 18 or over"
        checked={over18}
        onChange={setOver18}
        className="mb-4"
      />

      <Checkbox.Root
        testID="terms-checkbox"
        accessibilityLabel="I agree to the Terms & Conditions and have read the Privacy Policy"
        checked={acceptTerms}
        onChange={setAcceptTerms}
        className="mb-6 items-start"
      >
        <Checkbox.Icon checked={acceptTerms} />
        <Text className="flex-1 pl-2">
          I agree to the
          {' '}
          <Text className="font-bold underline" onPress={() => openExternalLink(TERMS_URL)}>
            Terms & Conditions
          </Text>
          {' '}
          and have read the
          {' '}
          <Text className="font-bold underline" onPress={() => openExternalLink(PRIVACY_URL)}>
            Privacy Policy
          </Text>
        </Text>
      </Checkbox.Root>

      <Button
        testID="accept-terms-button"
        label="Accept and continue"
        onPress={onAccept}
        loading={isAccepting}
        disabled={!over18 || !acceptTerms}
      />

      <Button
        testID="accept-terms-sign-out"
        label="Sign out"
        variant="ghost"
        onPress={() => void signOut()}
      />
    </ScrollView>
  );
}
