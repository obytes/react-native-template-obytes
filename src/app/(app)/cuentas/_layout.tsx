import { Stack } from 'expo-router';

export default function CuentasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Cuentas' }} />
      <Stack.Screen name="nueva" options={{ title: 'Nueva cuenta' }} />
      <Stack.Screen name="[id]" options={{ title: 'Cuenta' }} />
      <Stack.Screen name="categorias" options={{ headerShown: false }} />
    </Stack>
  );
}
