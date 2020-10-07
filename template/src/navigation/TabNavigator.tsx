import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Home, Style} from 'screens';
import {Home as HomeIcon, Settings} from 'ui';
const Tab = createBottomTabNavigator();

const getRouteIcon = (routeName: string): React.ReactNode => {
  let Icon = null;
  switch (routeName) {
    case 'Home':
      Icon = HomeIcon;
      break;
    case 'Style':
      Icon = Settings;
      break;
  }

  return Icon;
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size}) => {
          const Icon = getRouteIcon(route.name);
          return <Icon size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Style" component={Style} />
    </Tab.Navigator>
  );
};
