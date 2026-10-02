import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { PedigreeRow } from '@/features/stables/lib/horse-facts';
import type { HorseSectionKey } from '@/features/stables/lib/horse-sections';
import type { Entry, HorseDetail, HorseUpdate } from '@/features/stables/types';

import Env from 'env';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, Share, View } from 'react-native';

import {
  ActivityIndicator,
  Button,
  ChipRow,
  EmptyState,
  ErrorState,
  FocusAwareStatusBar,
  ScreenBackground,
  ScreenHeader,
} from '@/components/ui';
import { useScreenBottomPadding } from '@/components/ui/screen-layout';
import { useHorse } from '@/features/stables/api/use-horse';
import { useFollowHorse } from '@/features/stables/api/use-horse-follow';
import { useHorseUpdates } from '@/features/stables/api/use-horse-updates';
import { HorseHero } from '@/features/stables/components/horse-hero';
import { HorseUpdatesTimeline } from '@/features/stables/components/horse-updates-timeline';
import { RacingSection } from '@/features/stables/components/racing-section';
import { StorySection } from '@/features/stables/components/story-section';
import { WellbeingSection } from '@/features/stables/components/wellbeing-section';
import {
  buildHorseShareContent,
  getNextEntry,
  getPedigreeRows,
  getResults,
  getStoryText,
  getWellbeingUpdates,
} from '@/features/stables/lib/horse-facts';
import { getVisibleHorseSections } from '@/features/stables/lib/horse-sections';
import { tx } from '@/features/stables/lib/tx';
import { useSectionScrollSync } from '@/features/stables/lib/use-section-scroll-sync';
import { translate } from '@/lib/i18n';

const SECTION_LABELS: Record<HorseSectionKey, Parameters<typeof translate>[0]> = {
  story: 'stables.detail.sections.story',
  racing: 'stables.detail.sections.racing',
  updates: 'stables.detail.sections.updates',
  wellbeing: 'stables.detail.sections.wellbeing',
};

/** Hidden native header: the hero draws its own back/share bar. */
const SCREEN_OPTIONS = { headerShown: false } as const;

function useGoBack() {
  const router = useRouter();
  return React.useCallback(() => {
    if (router.canGoBack())
      router.back();
    else
      router.replace('/stables');
  }, [router]);
}

/** Loading / error / not-found: plain page with a back header (no hero). */
function StateScreen({ children }: { children: React.ReactNode }) {
  const goBack = useGoBack();
  return (
    <View className="flex-1">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <FocusAwareStatusBar />
      <ScreenBackground />
      <ScreenHeader onBack={goBack} backLabel={translate('stables.detail.backA11y')} />
      <View className="flex-1 justify-center px-4 pb-24">{children}</View>
    </View>
  );
}

type SectionsProps = {
  horse: HorseDetail;
  visible: HorseSectionKey[];
  story: string | null;
  pedigree: PedigreeRow[];
  nextEntry: Entry | undefined;
  results: Entry[];
  updates: HorseUpdate[];
  wellbeing: HorseUpdate[];
  onSectionLayout: (key: HorseSectionKey) => (event: LayoutChangeEvent) => void;
  onUpdateLayout: (id: string, y: number) => void;
  onOpenUpdate: (update: HorseUpdate) => void;
  onDiscussion: () => void;
};

/**
 * The stacked sections. Each wrapper is a direct child of the ScrollView
 * content so its `onLayout` y is a scroll offset (section-chip sync).
 */
function HorseSections(props: SectionsProps) {
  const { horse, visible, onSectionLayout } = props;
  return (
    <>
      {visible.includes('story')
        ? (
            <View testID="section-story" onLayout={onSectionLayout('story')} className="px-4 pb-2">
              <StorySection story={props.story} pedigree={props.pedigree} />
            </View>
          )
        : null}

      {visible.includes('racing')
        ? (
            <View testID="section-racing" onLayout={onSectionLayout('racing')} className="px-4 pb-2">
              <RacingSection nextEntry={props.nextEntry} results={props.results} />
            </View>
          )
        : null}

      {visible.includes('updates')
        ? (
            <View testID="section-updates" onLayout={onSectionLayout('updates')} className="px-4 pb-2">
              <HorseUpdatesTimeline updates={props.updates} onItemLayout={props.onUpdateLayout} />
            </View>
          )
        : null}

      {visible.includes('wellbeing')
        ? (
            <View testID="section-wellbeing" onLayout={onSectionLayout('wellbeing')} className="px-4 pb-2">
              <WellbeingSection updates={props.wellbeing} onOpenUpdate={props.onOpenUpdate} />
            </View>
          )
        : null}

      {horse.circleSpaceId
        ? (
            <View className="px-4 pt-4">
              <Button
                testID="horse-discussion"
                variant="secondary"
                label={translate('stables.detail.discussion')}
                onPress={props.onDiscussion}
              />
            </View>
          )
        : null}
    </>
  );
}

function useHorseDetailModel(horse: HorseDetail, updates: HorseUpdate[] | undefined) {
  const nextEntry = getNextEntry(horse.entries);
  const results = getResults(horse.entries);
  const story = getStoryText(horse);
  const pedigree = getPedigreeRows(horse);
  const updateList = updates ?? [];
  const wellbeing = getWellbeingUpdates(updateList);
  const visible = getVisibleHorseSections({
    hasStory: Boolean(story),
    hasPedigree: pedigree.length > 0,
    hasNextEntry: Boolean(nextEntry),
    resultCount: results.length,
    updateCount: updateList.length,
    wellbeingCount: wellbeing.length,
  });
  return { nextEntry, results, story, pedigree, updateList, wellbeing, visible };
}

function HorseDetailBody({ horse, updates }: { horse: HorseDetail; updates: HorseUpdate[] | undefined }) {
  const { toggleFollow, pendingHorseId } = useFollowHorse();
  const router = useRouter();
  const goBack = useGoBack();
  const bottomPadding = useScreenBottomPadding(32);
  const model = useHorseDetailModel(horse, updates);
  const { scrollRef, onSectionLayout, onScroll, scrollToSection, scrollToOffset, offsetsRef, selected } = useSectionScrollSync(model.visible);

  // Light status bar over the photo; dark once the hero has scrolled away.
  const [heroHeight, setHeroHeight] = React.useState(0);
  const [pastHero, setPastHero] = React.useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScroll(event);
    const next = heroHeight > 0 && event.nativeEvent.contentOffset.y > heroHeight - 60;
    setPastHero(prev => (prev === next ? prev : next));
  };

  // Wellbeing rows scroll to their update card in the Updates section.
  const updateOffsetsRef = React.useRef<Record<string, number>>({});
  const handleUpdateLayout = React.useCallback((id: string, y: number) => {
    updateOffsetsRef.current[id] = y;
  }, []);
  const openUpdate = (update: HorseUpdate) => {
    const sectionY = offsetsRef.current.updates;
    const itemY = updateOffsetsRef.current[update.id];
    if (sectionY != null && itemY != null)
      scrollToOffset(sectionY + itemY);
    else
      scrollToSection('updates');
  };

  const handleShare = () => {
    const message = tx('stables.detail.shareMessage', { name: horse.name, club: Env.EXPO_PUBLIC_CLUB_NAME });
    Share.share(buildHorseShareContent(horse, message)).catch(() => {});
  };

  const handleDiscussion = () => {
    if (horse.circleSpaceId) {
      router.push({
        pathname: '/space-feed/[space-id]',
        params: { 'space-id': horse.circleSpaceId, 'name': horse.name },
      });
    }
  };

  const chipItems = model.visible.map(key => ({ key, label: translate(SECTION_LABELS[key]) }));

  return (
    <View className="flex-1">
      <Stack.Screen options={SCREEN_OPTIONS} />
      <FocusAwareStatusBar barStyle={pastHero ? 'dark' : 'light'} />
      <ScreenBackground />
      <ScrollView
        ref={scrollRef}
        testID="horse-detail-scroll"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <View onLayout={e => setHeroHeight(e.nativeEvent.layout.height)}>
          <HorseHero
            horse={horse}
            declaredEntry={model.nextEntry?.status === 'DECLARED' ? model.nextEntry : undefined}
            followPending={pendingHorseId === horse.id}
            onToggleFollow={following => toggleFollow({ horseId: horse.id, following })}
            onBack={goBack}
            onShare={handleShare}
          />
        </View>

        {chipItems.length > 0
          ? (
              <View className="pt-5 pb-3">
                <ChipRow
                  testID="horse-section-chips"
                  items={chipItems}
                  selectedKey={selected}
                  onSelect={key => scrollToSection(key as HorseSectionKey)}
                  contentInset={16}
                />
              </View>
            )
          : null}

        <HorseSections
          horse={horse}
          visible={model.visible}
          story={model.story}
          pedigree={model.pedigree}
          nextEntry={model.nextEntry}
          results={model.results}
          updates={model.updateList}
          wellbeing={model.wellbeing}
          onSectionLayout={onSectionLayout}
          onUpdateLayout={handleUpdateLayout}
          onOpenUpdate={openUpdate}
          onDiscussion={handleDiscussion}
        />
      </ScrollView>
    </View>
  );
}

/**
 * Horse detail (S13-04, Figma frame 7): cinematic photo hero, then section
 * chips (Story · Racing · Updates · Wellbeing) that scroll to stacked
 * sections, with the selected chip following the scroll position.
 */
export function HorseDetailScreen() {
  const params = useLocalSearchParams<{ 'horse-id': string }>();
  const horseId = params['horse-id'];
  const { data: horse, isLoading, isError, refetch, isRefetching } = useHorse(horseId);
  const { data: updates } = useHorseUpdates(horseId);

  if (isLoading) {
    return (
      <StateScreen>
        <ActivityIndicator />
      </StateScreen>
    );
  }

  if (isError) {
    return (
      <StateScreen>
        <ErrorState testID="horse-error" onRetry={() => refetch()} retrying={isRefetching} />
      </StateScreen>
    );
  }

  if (!horse) {
    return (
      <StateScreen>
        <EmptyState
          testID="horse-not-found"
          title={translate('stables.detail.notFoundTitle')}
          body={translate('stables.detail.notFoundBody')}
        />
      </StateScreen>
    );
  }

  return <HorseDetailBody horse={horse} updates={updates} />;
}
