import { useLocalSearchParams } from 'expo-router';

import { AccountCategoryFormScreen } from '@/features/account-categories/account-category-form-screen';

export default function AccountCategoryEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AccountCategoryFormScreen categoryId={id} />;
}
