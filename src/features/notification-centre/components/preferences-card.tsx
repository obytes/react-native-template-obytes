import { useRouter } from 'expo-router';
import * as React from 'react';

import { Button, ListRow } from '@/components/ui';
import { usePreferences, useUpdatePreferences } from '@/features/settings/api/use-preferences';
import { PreferenceSwitch } from '@/features/settings/components/preference-switch';
import { SettingsCard } from '@/features/settings/components/settings-card';
import { INLINE_ROWS } from '@/features/settings/lib/notification-rows';
import { translate } from '@/lib/i18n';

/** Inline Preferences card under the inbox list (frame 17). Optimistic via `useUpdatePreferences`. */
export function PreferencesCard() {
  const router = useRouter();
  const { data } = usePreferences();
  const update = useUpdatePreferences();

  if (!data)
    return null;

  return (
    <SettingsCard testID="inbox-preferences" title={translate('settings.notifications.preferencesCard')}>
      {INLINE_ROWS.map(row => (
        <ListRow
          key={row.labelKey}
          label={translate(row.labelKey)}
          accessory={(
            <PreferenceSwitch
              testID={`inbox-pref-${row.labelKey}`}
              label={translate(row.labelKey)}
              value={data.pushEnabled && row.get(data)}
              disabled={!data.pushEnabled}
              onValueChange={v => update.mutate(row.set(v))}
            />
          )}
        />
      ))}
      <Button
        testID="inbox-all-preferences"
        variant="ghost"
        size="md"
        fullWidth={false}
        className="mt-3"
        label={translate('settings.notifications.allPreferences')}
        onPress={() => router.push('/settings/notifications')}
      />
    </SettingsCard>
  );
}
