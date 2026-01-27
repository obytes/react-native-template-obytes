import { useForm } from '@tanstack/react-form';

import { Stack } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import * as z from 'zod';

import {
  Button,
  Input,
  showErrorMessage,
  View,
} from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { useAddPost } from './api';

const schema = z.object({
  title: z.string().min(10),
  body: z.string().min(120),
});

export function AddPostScreen() {
  const { mutate: addPost, isPending } = useAddPost();

  const form = useForm({
    defaultValues: {
      title: '',
      body: '',
    },

    validators: {
      onChange: schema as any,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      addPost(
        { ...value, userId: 1 },
        {
          onSuccess: () => {
            showMessage({
              message: 'Post added successfully',
              type: 'success',
            });
            // here you can navigate to the post list and refresh the list data
            // queryClient.invalidateQueries(usePosts.getKey());
          },
          onError: () => {
            showErrorMessage('Error adding post');
          },
        },
      );
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Post',
          headerBackTitle: 'Feed',
        }}
      />
      <View className="flex-1 p-4">
        <form.Field
          name="title"
          children={field => (
            <Input
              label="Title"
              testID="title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />
        <form.Field
          name="body"
          children={field => (
            <Input
              label="Content"
              multiline
              testID="body-input"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />
        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              label="Add Post"
              loading={isPending || isSubmitting}
              onPress={form.handleSubmit}
              testID="add-post-button"
            />
          )}
        />
      </View>
    </>
  );
}
