import { colors } from '@/ui';

export const tabStyle = {
  tabBarActiveTintColor: colors.primary[400],
  tabBarInactiveTintColor: colors.neutral[600],
  tabBarStyle: [
    {
      backgroundColor: colors.white,
    },
    { borderTopWidth: 1, borderTopColor: colors.white },
  ],
};

export const darkTabStyle = {
  tabBarActiveTintColor: colors.primary[200],
  tabBarInactiveTintColor: colors.neutral[400],
  tabBarStyle: [
    {
      backgroundColor: colors.night.screen,
    },
    { borderTopWidth: 1, borderTopColor: colors.night.border },
  ],
};
