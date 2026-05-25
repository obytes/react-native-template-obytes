import { Stack } from 'expo-router';

export default function CategoriasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Categorías' }} />
      <Stack.Screen name="nueva" options={{ title: 'Nueva categoría' }} />
      <Stack.Screen name="[id]" options={{ title: 'Categoría' }} />
    </Stack>
  );
}
