import { Stack } from 'expo-router';
import React from 'react';

export default function HistoryLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
