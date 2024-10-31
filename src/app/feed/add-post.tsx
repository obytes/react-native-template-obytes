import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { useAddPost } from '@/api';
import { queryFactory } from '@/api/query-factory';
import { Button, ControlledInput, showErrorMessage, View } from '@/ui';

const TITLE_MIN_CHARS = 10;
const BODY_MIN_CHARS = 120;
const schema = z.object({
  title: z.string().min(TITLE_MIN_CHARS),
  body: z.string().min(BODY_MIN_CHARS),
});

type FormType = z.infer<typeof schema>;

export default function AddPost() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const { mutate: addPost, isPending } = useAddPost();
  const queryClient = useQueryClient();
  const router = useRouter();

  const onSubmit = (data: FormType) => {
    addPost(
      { ...data, userId: 1 },
      {
        onSuccess: () => {
          showMessage({
            message: 'Post added successfully',
            type: 'success',
          });
          // react-query-kit has the getKey method this will require to import the query function everywhere needed
          // queryClient.invalidateQueries(usePosts.getKey());
          queryClient.invalidateQueries({
            queryKey: queryFactory.posts.list({}).queryKey,
          });
          router.back();
        },
        onError: () => showErrorMessage('Error adding post'),
      },
    );
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Post',
          headerBackTitle: 'Feed',
        }}
      />
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
    </>
  );
}
