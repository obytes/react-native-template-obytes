import { Stack } from 'expo-router';

export default function MonedasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Monedas' }} />
    </Stack>
  );
}
