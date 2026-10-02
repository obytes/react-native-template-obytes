import type { StatusFilter } from '@/features/stables/lib/filter-horses';
import { Pressable, ScrollView, Text } from '@/components/ui';

// TODO(S8-01 §4 open question): re-add a "Declared" chip once its semantics
// are resolved with the spec owner. 'DECLARED' isn't a horse.status value —
// it's an entry-level EntryStatus — so filterHorsesByStatus can never match
// it today; shipping the chip would show every member "No horses match this
// filter" even when horses have genuinely declared entries. Wiring it up
// needs the list payload to carry the next entry's status (backend already
// exposes nextEntryId) and a filter on nextEntry.status === 'DECLARED'.
const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'IN_TRAINING', label: 'In training' },
  { value: 'PRE_TRAINING', label: 'Pre-training' },
  { value: 'RETIRED', label: 'Retired' },
];

type StatusFilterChipsProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

/**
 * Status filter chips for the stables list. The "Declared" chip is
 * intentionally omitted — see the TODO above FILTERS and
 * filterHorsesByStatus in ../lib/filter-horses.
 */
export function StatusFilterChips({ value, onChange }: StatusFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      className="mb-4"
    >
      {FILTERS.map((filter) => {
        const isActive = filter.value === value;
        return (
          <Pressable
            key={filter.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(filter.value)}
            className={`rounded-full px-3.5 py-2 ${isActive ? 'bg-primary' : 'bg-muted'}`}
          >
            <Text
              className={`font-mono text-[10px] tracking-widest uppercase ${
                isActive ? 'text-on-primary' : 'text-muted-foreground'
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
