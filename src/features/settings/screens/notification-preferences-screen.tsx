import * as React from 'react';

import {
  ActivityIndicator,
  ErrorState,
  FocusAwareStatusBar,
  ListRow,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import {
  usePreferences,
  useUpdatePreferences,
} from '@/features/settings/api/use-preferences';
import { PageHeader } from '@/features/settings/components/page-header';
import { PreferenceSwitch } from '@/features/settings/components/preference-switch';
import { SettingsCard } from '@/features/settings/components/settings-card';
import { EMAIL_ROWS, PUSH_ROWS } from '@/features/settings/lib/notification-rows';
import { translate } from '@/lib/i18n';

export function NotificationPreferencesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = usePreferences();
  const update = useUpdatePreferences();

  let body: React.ReactNode;
  if (isError && !data) {
    body = <ErrorState onRetry={() => void refetch()} retrying={isRefetching} />;
  }
  else if (isLoading || !data) {
    body = (
      <View className="items-center py-16">
        <ActivityIndicator />
      </View>
    );
  }
  else {
    const pushMasterOn = data.pushEnabled;
    body = (
      <>
        <SettingsCard>
          <ListRow
            label={translate('settings.notifications.enablePush')}
            divider={false}
            accessory={(
              <PreferenceSwitch
                testID="pref-push-enabled"
                label={translate('settings.notifications.enablePush')}
                value={pushMasterOn}
                onValueChange={v => update.mutate({ pushEnabled: v })}
              />
            )}
          />
        </SettingsCard>

        <SettingsCard title={translate('settings.notifications.pushSection')}>
          <Text variant="body-sm" className="pb-1 text-ink-variant">
            {translate('settings.notifications.pushHelper')}
          </Text>
          {PUSH_ROWS.map((row, i) => (
            <ListRow
              key={row.labelKey}
              label={translate(row.labelKey)}
              divider={i < PUSH_ROWS.length - 1}
              accessory={(
                <PreferenceSwitch
                  testID={`pref-${row.labelKey}`}
                  label={translate(row.labelKey)}
                  value={pushMasterOn && row.get(data)}
                  disabled={!pushMasterOn}
                  onValueChange={v => update.mutate(row.set(v))}
                />
              )}
            />
          ))}
        </SettingsCard>

        <SettingsCard title={translate('settings.notifications.emailSection')}>
          {EMAIL_ROWS.map((row, i) => (
            <ListRow
              key={row.labelKey}
              label={translate(row.labelKey)}
              divider={i < EMAIL_ROWS.length - 1}
              accessory={(
                <PreferenceSwitch
                  testID={`pref-${row.labelKey}`}
                  label={translate(row.labelKey)}
                  value={row.get(data)}
                  onValueChange={v => update.mutate(row.set(v))}
                />
              )}
            />
          ))}
        </SettingsCard>
      </>
    );
  }

  return (
    <View className="flex-1 bg-secondary-container">
      <FocusAwareStatusBar />
      <PageHeader kicker={translate('settings.notifications.title')} />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pt-6 pb-10">
        {body}
      </ScrollView>
    </View>
  );
}
