import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

import { AddPost, Feed, Post } from '@/screens';
import { Pressable, Text } from '@/ui';
import colors from '@/ui/theme/colors';

export type FeedStackParamList = {
  Feed: undefined;
  Post: { id: number };
  AddPost: undefined;
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

const GoToAddPost = () => {
  const { navigate } = useNavigation();
  return (
    <Pressable onPress={() => navigate('AddPost')} className="p-2">
      <Text className="text-primary-300">Create</Text>
    </Pressable>
  );
};

export const FeedNavigator = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? colors.night.screen : colors.white,
        },

        headerTintColor: isDark ? colors.night.text : colors.black,
      }}
    >
      <Stack.Group
        screenOptions={{
          // eslint-disable-next-line react/no-unstable-nested-components
          headerRight: () => <GoToAddPost />,
        }}
      >
        <Stack.Screen name="Feed" component={Feed} />
        <Stack.Screen name="Post" component={Post} />
      </Stack.Group>

      <Stack.Screen name="AddPost" component={AddPost} />
    </Stack.Navigator>
  );
};
