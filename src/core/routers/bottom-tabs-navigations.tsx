import { 
  Home as HomeIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from "@/ui/icons";

/**
 * @file bottomNavTabs.ts
 * @description This file defines the configuration for the bottom navigation tabs used in the app.
 * Each tab includes the route name, display title, visibility of the header, and the tab bar icon.
 */

/**
 * Interface representing the options for each bottom navigation tab.
 */
interface BottomNavTabOption {
  title: string;
  headerShown: boolean;
  tabBarIcon: (props: { color: string }) => JSX.Element;
  tabBarTestID: string;
}

/**
 * Interface representing a bottom navigation tab.
 */
interface BottomNavTab {
  name: string;
  options: BottomNavTabOption;
}

/**
 * bottomNavTabs
 * @description Array of objects representing the configuration for each bottom navigation tab.
 * Each object in the array represents a single tab in the bottom navigation bar.
 */
export const bottomNavTabs: BottomNavTab[] = [
  {
    name: 'index',
    options: {
      title: 'Home',
      headerShown: false,
      tabBarIcon: ({ color }) => <HomeIcon color={color} />,
      tabBarTestID: 'home-tab',
    }
  },
  {
    name: 'style',
    options: {
      title: 'Style',
      headerShown: false,
      tabBarIcon: ({ color }) => <StyleIcon color={color} />,
      tabBarTestID: 'style-tab',
    }
  },
  {
    name: 'settings',
    options: {
      title: 'Settings',
      headerShown: false,
      tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
      tabBarTestID: 'settings-tab',
    }
  }
];
