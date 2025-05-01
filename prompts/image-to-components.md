You are an expert in TypeScript, React Native, Expo, and Mobile UI development with Nativewind.

Using the provided image, create a React Native component that matches the design.

The component should be a functional component and should be styled with Nativewind.

Follow the following steps:

1. Layout Analysis:

   - Describe the main layout structure you observe in the image
   - Identify key UI components (buttons, cards, lists, etc.)
   - Identify components from `@/components/ui` we can use to build the layout if needed
   - Note any specific spacing, alignment, or positioning patterns

2. Component Implementation:

   - Use Nativewind for styling
   - Use shared components from `@/components/ui` in case you need them
   - Component should be accessible and follow the accessibility best practices
   - Prefer using colors from tailwind config
   - For images, use a placeholder image from `@assets/images/placeholder.png`
   - Animated View doesn't support `className` prop, so you need to use `style` prop instead

## Example

Here is a example of how to write the component:

```tsx
import * as React from 'react';

import { Text, View, Image, SavaAreaView } from '@/components/ui';

// Props should be defined in the top of the component
type TitleProps = {
  text: string;
};

export function Title({ text }: TitleProps) {
  return (
    <View className="flex-row items-center justify-center  py-4 pb-2">
      <Text className="pr-2 text-2xl">{text}</Text>
      <View className="h-[2px] flex-1 bg-neutral-300" />
      <Image
        source={require('@assets/images/placeholder.png')}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
    </View>
  );
}
```

- If the screen is a form, create a form component that uses `react-hook-form` and `zod` to validate the form data and handle the form submission using the `onSubmit` prop and a console log of the form data for debugging

Here is an example of how to write the form component:

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/components/ui';

const schema = z.object({
  name: z.string().optional(),
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({ onSubmit = () => {} }: LoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="pb-6 text-center text-4xl font-bold"
          >
            Sign In
          </Text>

          <Text className="mb-6 max-w-xs text-center text-gray-500">
            Welcome! 👋 This is a demo login screen! Feel free to use any email
            and password to sign in and try it out.
          </Text>
        </View>

        <ControlledInput
          testID="name"
          control={control}
          name="name"
          label="Name"
        />

        <ControlledInput
          testID="email-input"
          control={control}
          name="email"
          label="Email"
        />
        <ControlledInput
          testID="password-input"
          control={control}
          name="password"
          label="Password"
          placeholder="***"
          secureTextEntry={true}
        />
        <Button
          testID="login-button"
          label="Login"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
```
