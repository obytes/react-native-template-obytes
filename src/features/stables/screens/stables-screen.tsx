import type { StablesFilter } from '@/features/stables/lib/stables-filters';
import type { Horse } from '@/features/stables/types';
import type { TxKeyPath } from '@/lib/i18n';

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { RefreshControl, View } from 'react-native';

import {
  ActivityIndicator,
  ChipRow,
  EmptyState,
  ErrorState,
  FocusAwareStatusBar,
  MonoLabel,
  ScreenBackground,
  Text,
} from '@/components/ui';
import { List } from '@/components/ui/list';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { useFollowHorse } from '@/features/stables/api/use-horse-follow';
import { useHorses } from '@/features/stables/api/use-horses';
import { HorseCard } from '@/features/stables/components/horse-card';
import {
  applyStablesFilter,
  buildStablesFilterChips,
  parseStablesFilterParam,
  resolveStablesFilter,
} from '@/features/stables/lib/stables-filters';
import { translate } from '@/lib/i18n';

const CHIP_LABELS: Record<StablesFilter, TxKeyPath> = {
  all: 'stables.list.filterAll',
  following: 'stables.list.filterFollowing',
  PRE_TRAINING: 'stables.status.preTraining',
  IN_TRAINING: 'stables.status.inTraining',
  REHAB: 'stables.status.rehab',
  RETIRED: 'stables.status.retired',
};

function StablesHeader({
  horses,
  filter,
  onFilterChange,
}: {
  horses: Horse[];
  filter: StablesFilter;
  onFilterChange: (filter: StablesFilter) => void;
}) {
  const chips = buildStablesFilterChips(horses).map(chip => ({
    key: chip.key,
    label: translate(CHIP_LABELS[chip.key]),
    count: chip.count,
  }));
  return (
    <View className="gap-8 pb-3">
      <View className="gap-2">
        <Text variant="display-lg" accessibilityRole="header">{translate('stables.list.title')}</Text>
        <Text variant="body">{translate('stables.list.subtitle')}</Text>
      </View>
      <View className="gap-2.5">
        <MonoLabel>{translate('stables.list.kicker')}</MonoLabel>
        {/* Bleed the chip row to the screen edges; the inset keeps the first chip on the gutter. */}
        <View className="-mx-4">
          <ChipRow
            testID="stables-filter-chips"
            items={chips}
            selectedKey={filter}
            onSelect={key => onFilterChange(key as StablesFilter)}
            contentInset={16}
          />
        </View>
      </View>
    </View>
  );
}

function FilterEmpty({ filter }: { filter: StablesFilter }) {
  return filter === 'following'
    ? (
        <EmptyState
          testID="stables-empty-following"
          title={translate('stables.list.emptyFollowingTitle')}
          body={translate('stables.list.emptyFollowingBody')}
        />
      )
    : (
        <EmptyState
          testID="stables-empty-filter"
          title={translate('stables.list.emptyFilterTitle')}
          body={translate('stables.list.emptyFilterBody')}
        />
      );
}

/**
 * Stables list (S13-04, Figma frame 6). `?filter=following` preselects the
 * Following chip (S13-08 links with it); anything else opens on All.
 */
export function StablesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useHorses();
  const { toggleFollow, pendingHorseId } = useFollowHorse();
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const contentPaddingBottom = useTabBarContentPadding(16);
  const contentPaddingTop = useScreenTopPadding(20);

  // The tab stays mounted, so a later navigation with a new `filter` param
  // must re-apply it (state adjusted during render, not in an effect).
  const [requested, setRequested] = React.useState<StablesFilter>(() => parseStablesFilterParam(params.filter));
  const [lastParam, setLastParam] = React.useState(params.filter);
  if (params.filter !== lastParam) {
    setLastParam(params.filter);
    setRequested(parseStablesFilterParam(params.filter));
  }

  const horses = React.useMemo(() => data ?? [], [data]);
  const filter = resolveStablesFilter(requested, buildStablesFilterChips(horses));
  const filtered = React.useMemo(() => applyStablesFilter(horses, filter), [horses, filter]);

  const handlePress = React.useCallback(
    (horseId: string) => router.push(`/stables/${horseId}`),
    [router],
  );
  const handleToggleFollow = React.useCallback(
    (horseId: string, following: boolean) => toggleFollow({ horseId, following }),
    [toggleFollow],
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

  const pagePadding = { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ScreenBackground />
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || horses.length === 0) {
    return (
      <View className="flex-1 px-4" style={pagePadding}>
        <FocusAwareStatusBar />
        <ScreenBackground />
        <View className="gap-2 pb-8">
          <Text variant="display-lg" accessibilityRole="header">{translate('stables.list.title')}</Text>
          <Text variant="body">{translate('stables.list.subtitle')}</Text>
        </View>
        {isError
          ? (
              <ErrorState
                testID="stables-error"
                body={translate('stables.list.errorBody')}
                onRetry={() => refetch()}
                retrying={isRefetching}
              />
            )
          : (
              <EmptyState
                testID="stables-empty"
                title={translate('stables.list.emptyTitle')}
                body={translate('stables.list.emptyBody')}
              />
            )}
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FocusAwareStatusBar />
      <ScreenBackground />
      <List
        data={filtered}
        extraData={filter}
        ListHeaderComponent={(
          <StablesHeader horses={horses} filter={filter} onFilterChange={setRequested} />
        )}
        ListEmptyComponent={<FilterEmpty filter={filter} />}
        renderItem={renderItem}
        keyExtractor={(item: Horse) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, ...pagePadding }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />
    </View>
  );
}
