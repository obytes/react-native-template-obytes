import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { KeyboardAvoidingView } from 'react-native';
import z from 'zod';

import { Button, ControlledInput,Text, View } from '@/ui';

const MIN_PASSWORD_LENGTH = 6;

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(MIN_PASSWORD_LENGTH, 'Password must be at least 6 characters');

const schema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    name: z.string({ required_error: 'Name is required' }),
    password: passwordSchema,
    passwordConfirmation: z.string({
      required_error: 'Password confirmation is required',
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
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
      <View className="flex-1 justify-center p-4">
        <Text testID="form-title" className="pb-6 text-center text-2xl">
          Sign Up
        </Text>

        <ControlledInput
          testID="email-input"
          autoCapitalize="none"
          autoComplete="email"
          control={control}
          name="email"
          label="Email"
        />
        <ControlledInput
          testID="name-input"
          control={control}
          name="name"
          label="Name"
        />
        <ControlledInput
          testID="password-input"
          control={control}
          name="password"
          label="Password"
          placeholder="***"
          secureTextEntry={true}
        />
        <ControlledInput
          testID="password-confirmation-input"
          control={control}
          name="passwordConfirmation"
          label="Password Confirmation"
          placeholder="***"
          secureTextEntry={true}
        />

        <Button
          testID="sign-up-button"
          label="Sign Up"
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
          disabled={isPending}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
