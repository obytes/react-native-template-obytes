import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import {
  Button,
  FocusAwareStatusBar,
  Input,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { signIn, useAuthStore } from '@/features/auth/use-auth-store';
import { PageHeader } from '@/features/settings/components/page-header';
import { client } from '@/lib/api/client';
import { translate } from '@/lib/i18n';

const schema = z.object({
  name: z.string().trim().min(1, translate('settings.personalDetails.nameRequired')),
});

/**
 * Name is editable through better-auth's `update-user` endpoint, the same
 * call `mobile-org-bootstrap` already makes. Email is read-only (changing it
 * needs a verification flow we do not ship).
 */
export function PersonalDetailsScreen() {
  const user = useAuthStore.use.user();
  const token = useAuthStore.use.token();
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const form = useForm({
    defaultValues: { name: user?.name ?? '' },
    validators: { onChange: schema as any },
    onSubmit: async ({ value }) => {
      setError(null);
      setSaved(false);
      const name = value.name.trim();
      try {
        await client.post('/api/auth/update-user', { name });
        if (token && user)
          signIn(token, { ...user, name });
        setSaved(true);
      }
      catch {
        setError(translate('settings.personalDetails.error'));
      }
    },
  });

  return (
    <View className="flex-1 bg-secondary-container">
      <FocusAwareStatusBar />
      <PageHeader kicker={translate('settings.personalDetails.title')} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView className="flex-1" contentContainerClassName="gap-4 px-4 pt-6 pb-10" keyboardShouldPersistTaps="handled">
          <View>
            <form.Field
              name="name"
              children={field => (
                <Input
                  testID="personal-name"
                  label={translate('settings.personalDetails.name')}
                  autoCapitalize="words"
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={(v: string) => {
                    setSaved(false);
                    field.handleChange(v);
                  }}
                  error={getFieldError(field)}
                />
              )}
            />
            <Input
              testID="personal-email"
              label={translate('settings.personalDetails.email')}
              value={user?.email ?? ''}
              editable={false}
              disabled
            />
          </View>

          {error
            ? <Text variant="body" className="text-center text-danger-700">{error}</Text>
            : null}
          {saved
            ? <Text variant="body" className="text-center text-ink-variant" testID="personal-saved">{translate('settings.personalDetails.saved')}</Text>
            : null}

          <form.Subscribe
            selector={state => [state.isSubmitting, state.canSubmit]}
            children={([isSubmitting, canSubmit]) => (
              <Button
                testID="personal-save"
                label={translate('settings.personalDetails.save')}
                onPress={form.handleSubmit}
                loading={isSubmitting}
                disabled={!canSubmit || isSubmitting}
              />
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
