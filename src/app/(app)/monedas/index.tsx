import { CurrencyBottomSheet } from '@/features/currencies/components/currency-bottom-sheet';
import { CurrenciesScreen } from '@/features/currencies/currencies-screen';

export default function MonedasPage() {
  return <CurrenciesScreen BottomSheet={CurrencyBottomSheet} />;
}
