import Env from 'env';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';

import {
  Avatar,
  Button,
  FocusAwareStatusBar,
  IconButton,
  ListRow,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { PencilV2 } from '@/components/ui/icons/v2';
import { Tag } from '@/components/ui/mono-label';
import { signOut, useAuthStore } from '@/features/auth/use-auth-store';
import { PageHeader } from '@/features/settings/components/page-header';
import { SettingsCard } from '@/features/settings/components/settings-card';
import { translate } from '@/lib/i18n';
import { openExternalLink } from '@/lib/open-external-link';

const PRIVACY_URL = 'https://rionna.com/legal/privacy-policy';
const TERMS_URL = 'https://rionna.com/legal/terms';
const SUPPORT_EMAIL = 'hello@rionna.com';

function ProfileIdentity({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3">
      <Avatar ring size={56} name={name} testID="profile-avatar" />
      <View className="flex-1 gap-1">
        <Text variant="display-md" numberOfLines={2}>{name}</Text>
        {/* ⏳ S13-12: "Founding member, since {Month YYYY}" replaces the email. */}
        <Text variant="body" className="text-ink-variant" numberOfLines={1}>
          {email}
        </Text>
      </View>
      <IconButton
        variant="circle-light"
        accessibilityLabel={translate('settings.profile.personalDetails')}
        onPress={() => router.push('/settings/personal-details')}
        testID="profile-edit"
      >
        <PencilV2 size={18} />
      </IconButton>
    </View>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore.use.user();
  const displayName = user?.name?.trim() || translate('settings.profile.fallbackName');

  const openSupport = () => {
    const subject = encodeURIComponent(translate('settings.profile.helpSubject'));
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}`).catch(() => {});
  };

  return (
    <View className="flex-1 bg-secondary-container">
      <FocusAwareStatusBar />
      <PageHeader kicker={translate('settings.profile.title')} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pt-6 pb-10"
      >
        <ProfileIdentity name={displayName} email={user?.email ?? ''} />

        {/* D9: membership is display-only. No billing, renewal or payment-history UI. */}
        <SettingsCard title={translate('settings.profile.membership')} testID="membership-card">
          <ListRow
            label={translate('settings.profile.membershipStatus')}
            value={<Tag variant="navy" label={translate('settings.profile.statusActive')} />}
            divider={false}
          />
        </SettingsCard>

        <SettingsCard testID="settings-card">
          <ListRow
            testID="row-personal-details"
            label={translate('settings.profile.personalDetails')}
            chevron
            onPress={() => router.push('/settings/personal-details')}
          />
          <ListRow
            testID="row-notification-preferences"
            label={translate('settings.notifications.preferences')}
            chevron
            onPress={() => router.push('/settings/notifications')}
          />
          <ListRow
            testID="row-followed-horses"
            label={translate('settings.profile.followedHorses')}
            chevron
            onPress={() => router.navigate({ pathname: '/stables', params: { filter: 'following' } })}
          />
          <ListRow
            testID="row-help"
            label={translate('settings.profile.help')}
            chevron
            onPress={openSupport}
          />
          <ListRow
            testID="row-change-password"
            label={translate('settings.account.changePassword')}
            chevron
            onPress={() => router.push('/settings/change-password')}
          />
          <ListRow
            testID="row-privacy"
            label={translate('settings.privacy')}
            chevron
            onPress={() => openExternalLink(PRIVACY_URL)}
          />
          <ListRow
            testID="row-terms"
            label={translate('settings.terms')}
            chevron
            onPress={() => openExternalLink(TERMS_URL)}
          />
          <ListRow
            testID="row-delete-account"
            label={translate('settings.account.deleteAccount')}
            chevron
            divider={false}
            onPress={() => router.push('/settings/delete-account')}
          />
        </SettingsCard>

        <Button
          variant="secondary"
          label={translate('settings.profile.logout')}
          onPress={signOut}
          testID="sign-out-button"
        />

        <Text variant="body-sm" className="text-center text-ink-muted">
          {`${Env.EXPO_PUBLIC_CLUB_NAME} · ${translate('settings.version')} ${Env.EXPO_PUBLIC_VERSION}`}
        </Text>
      </ScrollView>
    </View>
  );
}
