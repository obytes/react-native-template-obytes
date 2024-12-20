import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList } from 'react-native';

import { type Comment, usePost, usePostComments } from '@/api';
import { ActivityIndicator, FocusAwareStatusBar, Text, View } from '@/ui';

export default function Post() {
  const local = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError } = usePost({
    variables: { id: local.id },
  });

  const {
    data: { comments } = { comments: [] },
    isLoading: isLoadingComments,
  } = usePostComments({
    variables: { id: data?.id },
  });

  if (isPending) {
    return (
      <View className="flex-1 justify-center  p-3">
        <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
        <FocusAwareStatusBar />
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 justify-center p-3">
        <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
        <FocusAwareStatusBar />
        <Text className="text-center">Error loading post</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-3 ">
      <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
      <FocusAwareStatusBar />
      <Text className="text-xl">{data.title}</Text>
      <Text>{data.body} </Text>
      {isLoadingComments ? (
        <View>
          <Text>Loading comments...</Text>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList<Comment>
          data={comments}
          renderItem={({ item: comment }) => (
            <View className="flex-row items-center" key={comment.id}>
              <View className="mr-2 h-3 w-3 rounded-full bg-slate-500" />
              <Text key={comment.id}>{comment.body}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text>No comments yet</Text>}
          ListHeaderComponent={
            <Text className="text-lg font-semibold">Comments:</Text>
          }
        />
      )}
    </View>
  );
}
