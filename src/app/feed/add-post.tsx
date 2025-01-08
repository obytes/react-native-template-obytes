import { Stack } from 'expo-router';
export default function AddPost() {
  return (
    <Stack.Screen
      options={{
        title: 'Add Post',
        headerBackTitle: 'Feed',
      }}
    />
  );
}
