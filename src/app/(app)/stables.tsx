import type { StatusFilter } from '@/features/stables/lib/filter-horses';
import type { Horse } from '@/features/stables/types';
import { useRouter } from 'expo-router';
import * as React from 'react';

import { RefreshControl } from 'react-native';
import { ActivityIndicator, Text, View } from '@/components/ui';
import { List } from '@/components/ui/list';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useFollowHorse } from '@/features/stables/api/use-horse-follow';
import { useHorses } from '@/features/stables/api/use-horses';
import { HorseCard } from '@/features/stables/components/horse-card';
import { StatusFilterChips } from '@/features/stables/components/status-filter-chips';
import { filterHorsesByStatus } from '@/features/stables/lib/filter-horses';

function StablesHeader({
  statusFilter,
  onStatusFilterChange,
}: {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
}) {
  return (
    <View className="mb-2 px-1">
      <Text className="font-mono text-[10px] tracking-widest text-label uppercase">
        Our horses
      </Text>
      <Text className="mt-2 mb-4 font-sans-semibold text-3xl text-ink">Stables</Text>
      <StatusFilterChips value={statusFilter} onChange={onStatusFilterChange} />
    </View>
  );
}

export default function StablesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useHorses();
  const { toggleFollow, pendingHorseId } = useFollowHorse();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('ALL');
  const router = useRouter();
  const contentPaddingBottom = useTabBarContentPadding(16);
  const contentPaddingTop = useScreenTopPadding();

  const handlePress = React.useCallback(
    (horseId: string) => {
      router.push(`/stables/${horseId}`);
    },
    [router],
  );

  const handleToggleFollow = React.useCallback(
    (horseId: string, following: boolean) => {
      toggleFollow({ horseId, following });
    },
    [toggleFollow],
  );

  const filteredData = React.useMemo(
    () => (data ? filterHorsesByStatus(data, statusFilter) : data),
    [data, statusFilter],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: Horse }) => (
      <HorseCard
        horse={item}
        onPress={() => handlePress(item.id)}
        onToggleFollow={handleToggleFollow}
        followPending={pendingHorseId === item.id}
      />
    ),
    [handlePress, handleToggleFollow, pendingHorseId],
  );

  const listHeader = React.useCallback(
    () => (
      <StablesHeader statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />
    ),
    [statusFilter],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center text-ink-muted">
          Something went wrong loading the stables.
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="font-sans-semibold text-lg text-ink-variant">
          No horses yet
        </Text>
        <Text className="mt-1 text-center text-ink-muted">
          Horses will appear here once they're added.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <List
        data={filteredData}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={(
          <View className="items-center px-1 py-12">
            <Text className="text-center text-ink-muted">
              No horses match this filter.
            </Text>
          </View>
        )}
        renderItem={renderItem}
        keyExtractor={(item: Horse) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom,
        }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
    </View>
  );
}
