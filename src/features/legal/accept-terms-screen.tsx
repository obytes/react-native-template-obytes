import * as React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Checkbox, ScreenBackground, Text, View } from '@/components/ui';
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
    <View className="flex-1">
      <ScreenBackground variant="welcome-light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 32,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <Text variant="display-lg" className="mb-2">
          Terms & Conditions
        </Text>
        <Text variant="body" className="mb-6 text-ink-variant">
          Please confirm you are 18 or over and accept our Terms & Conditions to continue.
        </Text>

        {error && (
          <View className="mb-4 rounded-lg bg-plum p-3">
            <Text variant="body-sm" className="text-center text-on-primary">{error}</Text>
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
          <Text variant="body" className="flex-1 pl-2">
            I agree to the
            {' '}
            <Text className="font-sans-bold underline" onPress={() => openExternalLink(TERMS_URL)}>
              Terms & Conditions
            </Text>
            {' '}
            and have read the
            {' '}
            <Text className="font-sans-bold underline" onPress={() => openExternalLink(PRIVACY_URL)}>
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
    </View>
  );
}
