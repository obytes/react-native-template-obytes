import { useLocalSearchParams } from 'expo-router';

import { AccountFormScreen } from '@/features/accounts/account-form-screen';

export default function CuentasEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AccountFormScreen accountId={id} />;
}
