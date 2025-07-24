import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import { Pressable, Text } from '@/components/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime } from '@/lib';
import AddPost from '@/screens/add-post';
import Feed from '@/screens/feed';
import Login from '@/screens/login';
import Onboarding from '@/screens/onboarding';
import Post from '@/screens/post-detail';
import Settings from '@/screens/settings';
import Style from '@/screens/style';

export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  Login: undefined;
  Post: { id: string };
  AddPost: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          headerRight: () => (
            <Pressable onPress={() => navigation.navigate('AddPost')}>
              <Text className="px-3 text-primary-300">Create</Text>
            </Pressable>
          ),
        }}
      />
      <Tab.Screen
        name="Style"
        component={Style}
        options={{
          title: 'Style',
          tabBarIcon: ({ color }) => <StyleIcon color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isFirstTime ? (
        <Stack.Screen name="Onboarding" component={Onboarding} />
      ) : status === 'signOut' ? (
        <Stack.Screen name="Login" component={Login} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
      <Stack.Screen
        name="Post"
        component={Post}
        options={{ headerShown: true, title: 'Post' }}
      />
      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={{ headerShown: true, title: 'Add Post' }}
      />
    </Stack.Navigator>
  );
}
