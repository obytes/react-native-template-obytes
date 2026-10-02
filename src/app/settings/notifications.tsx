import * as React from 'react';

import { ActivityIndicator, Switch } from 'react-native';
import {
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import {
  usePreferences,
  useUpdatePreferences,
} from '@/features/settings/api/use-preferences';
import { EMAIL_ROWS, PUSH_ROWS } from '@/features/settings/lib/notification-rows';
import { translate } from '@/lib/i18n';

export default function NotificationsScreen() {
  const { data, isLoading, isError } = usePreferences();
  const update = useUpdatePreferences();

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center text-ink-muted">
          Couldn't load preferences. Pull down or try again.
        </Text>
      </View>
    );
  }

  const pushMasterOn = data.pushEnabled;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-background">
        <View className="flex-1 px-4 pt-6 pb-10">
          <SectionLabel text="settings.notifications.enablePush" />
          <ToggleRow
            labelKey="settings.notifications.enablePush"
            value={pushMasterOn}
            onChange={v => update.mutate({ pushEnabled: v })}
          />

          <SectionLabel text="settings.notifications.pushSection" />
          <Text className="px-4 pb-2 font-sans text-xs text-ink-muted">
            {translate('settings.notifications.pushHelper')}
          </Text>
          {PUSH_ROWS.map(row => (
            <ToggleRow
              key={row.labelKey}
              labelKey={row.labelKey}
              value={pushMasterOn && row.get(data)}
              disabled={!pushMasterOn}
              onChange={v => update.mutate(row.set(v))}
            />
          ))}

          <SectionLabel text="settings.notifications.emailSection" />
          {EMAIL_ROWS.map(row => (
            <ToggleRow
              key={row.labelKey}
              labelKey={row.labelKey}
              value={row.get(data)}
              onChange={v => update.mutate(row.set(v))}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function SectionLabel({ text }: { text: Parameters<typeof translate>[0] }) {
  return (
    <Text className="pt-6 pb-2 text-sm font-medium text-ink-muted uppercase">
      {translate(text)}
    </Text>
  );
}

function ToggleRow({
  labelKey,
  value,
  disabled,
  onChange,
}: {
  labelKey: Parameters<typeof translate>[0];
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="my-1 flex-row items-center justify-between rounded-md border border-outline-variant bg-white px-4 py-3">
      <Text
        className={
          disabled ? 'text-ink-muted' : 'text-ink'
        }
      >
        {translate(labelKey)}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}
