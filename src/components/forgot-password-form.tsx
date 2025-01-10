import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { translate } from '@/core';
import { Button, ControlledInput, Text, View } from '@/ui';

const schema = z.object({
  email: z
    .string()
    .email(translate('forgotPassword.emailInvalidFormatFormError')),
});

export type FormType = z.infer<typeof schema>;

export type ForgotPasswordFormProps = {
  onSubmit: (data: FormType) => void;
};

export const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
  const { t } = useTranslation();
  const { handleSubmit, control } = useForm<{
    email: string;
  }>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormType) => {
    props.onSubmit(data);
  };

  return (
    <KeyboardAvoidingView>
      <View className="gap-8 p-4">
        <View className="gap-2">
          <Text
            testID="forgot-password-form-title"
            className="text-center text-2xl"
          >
            {t('forgotPassword.title')}
          </Text>
          <Text className="text-center text-gray-600">
            {t('forgotPassword.description')}
          </Text>
        </View>
        <View className="gap-2">
          <ControlledInput
            testID="email-input"
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            name="email"
            label={t('forgotPassword.emailLabel')}
            placeholder={t('forgotPassword.emailPlaceholder')}
          />
          <Text className="text-sm text-gray-500">
            {t('forgotPassword.instructions')}
          </Text>
          <Button
            testID="send-email-button"
            label={t('forgotPassword.buttonLabel')}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
