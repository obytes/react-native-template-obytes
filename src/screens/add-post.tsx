import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { useAddPost } from '@/api';
import {
  Button,
  ControlledInput,
  showErrorMessage,
  View,
} from '@/components/ui';

const schema = z.object({
  title: z.string().min(10),
  body: z.string().min(120),
});

type FormType = z.infer<typeof schema>;

export default function AddPost() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const { mutate: addPost, isPending } = useAddPost();
  const navigation = useNavigation();

  const onSubmit = (data: FormType) => {
    addPost(
      { ...data, userId: 1 },
      {
        onSuccess: () => {
          showMessage({
            message: 'Post added successfully',
            type: 'success',
          });
          navigation.goBack();
        },
        onError: () => {
          showErrorMessage('Error adding post');
        },
      }
    );
  };
  return (
    <View className="flex-1 p-4 ">
      <ControlledInput
        name="title"
        label="Title"
        control={control}
        testID="title"
      />
      <ControlledInput
        name="body"
        label="Content"
        control={control}
        multiline
        testID="body-input"
      />
      <Button
        label="Add Post"
        loading={isPending}
        onPress={handleSubmit(onSubmit)}
        testID="add-post-button"
      />
    </View>
  );
}
