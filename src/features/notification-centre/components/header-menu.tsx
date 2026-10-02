import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, Text } from '@/components/ui';

const DOTS = [0, 1, 2];

/** The ⋮ trigger for the header's right slot. */
export function MenuButton({ onPress, expanded }: { onPress: () => void; expanded: boolean }) {
  return (
    <Pressable
      testID="inbox-menu"
      accessibilityRole="button"
      accessibilityLabel="More actions"
      accessibilityState={{ expanded }}
      onPress={onPress}
      className="size-11 items-center justify-center gap-[3px]"
    >
      {DOTS.map(i => <View key={i} className="size-1 rounded-full bg-ink" />)}
    </Pressable>
  );
}

type MenuSheetProps = {
  /** Distance from the screen top to place the sheet (below the header). */
  top: number;
  onDismiss: () => void;
  onMarkAllRead: () => void;
};

/** Dropdown for the ⋮ menu; the dimless backdrop dismisses on outside tap. */
export function MenuSheet({ top, onDismiss, onMarkAllRead }: MenuSheetProps) {
  return (
    <>
      <Pressable
        testID="inbox-menu-backdrop"
        accessibilityLabel="Close menu"
        style={StyleSheet.absoluteFill}
        onPress={onDismiss}
      />
      <View
        className="absolute right-4 min-w-44 overflow-hidden rounded-lg bg-white"
        style={{ top, shadowColor: colors.ink, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
      >
        <Pressable
          testID="inbox-mark-all"
          accessibilityRole="button"
          onPress={() => {
            onDismiss();
            onMarkAllRead();
          }}
          className="px-4 py-3"
        >
          <Text variant="body-lg">Mark all as read</Text>
        </Pressable>
      </View>
    </>
  );
}
