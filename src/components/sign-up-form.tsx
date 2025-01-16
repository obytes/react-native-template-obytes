import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { KeyboardAvoidingView } from 'react-native';
import z from 'zod';

import { translate } from '@/core';
import { Button, ControlledInput, Text, View } from '@/ui';

const MIN_PASSWORD_LENGTH = 6;

const passwordSchema = z
  .string({ required_error: translate('auth.sign_up.error.passwordRequired') })
  .min(MIN_PASSWORD_LENGTH, translate('auth.sign_up.error.shortPassword'));

const schema = z
  .object({
    email: z
      .string({ required_error: translate('auth.sign_up.error.emailRequired') })
      .email(translate('auth.sign_up.error.emailInvalid')),
    name: z.string({
      required_error: translate('auth.sign_up.error.nameRequired'),
    }),
    password: passwordSchema,
    passwordConfirmation: z.string({
      required_error: translate(
        'auth.sign_up.error.passwordConfirmationRequired',
      ),
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: translate('auth.sign_up.error.passwordsDoNotMatch'),
    path: ['passwordConfirmation'],
  });

export type FormType = z.infer<typeof schema>;

export type SignUpFormProps = {
  onSubmit?: SubmitHandler<FormType>;
  isPending?: boolean;
};

export const SignUpForm = ({
  onSubmit = () => {},
  isPending = false,
}: SignUpFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center gap-4 p-4">
        <Text testID="form-title" className="text-center text-2xl">
          {translate('auth.sign_up.title')}
        </Text>
        <View>
          <ControlledInput
            testID="email-input"
            autoCapitalize="none"
            autoComplete="email"
            control={control}
            name="email"
            label={translate('auth.sign_up.fields.email')}
          />
          <ControlledInput
            testID="name-input"
            control={control}
            name="name"
            label={translate('auth.sign_up.fields.name')}
          />
          <ControlledInput
            testID="password-input"
            control={control}
            name="password"
            label={translate('auth.sign_up.fields.password')}
            placeholder="***"
            secureTextEntry={true}
          />
          <ControlledInput
            testID="password-confirmation-input"
            control={control}
            name="passwordConfirmation"
            label={translate('auth.sign_up.fields.password')}
            placeholder="***"
            secureTextEntry={true}
          />

          <Button
            testID="sign-up-button"
            label={translate('auth.sign_up.signUpButton')}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            disabled={isPending}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
