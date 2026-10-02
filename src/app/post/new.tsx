import { Stack } from 'expo-router';

import { ComposePostScreen } from '@/features/community-posting/screens/compose-post-screen';

/** `post/new` is presented as a native modal; the screen draws its own kicker header. */
export default function NewPostRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ComposePostScreen />
    </>
  );
}
