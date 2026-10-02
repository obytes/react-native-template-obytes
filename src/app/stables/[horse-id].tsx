import type { Entry, HorseUpdate } from '@/features/stables/types';

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useScreenTopPadding } from '@/components/ui/screen-layout';
import { useHorse } from '@/features/stables/api/use-horse';
import { useFollowHorse } from '@/features/stables/api/use-horse-follow';
import { useHorseUpdates } from '@/features/stables/api/use-horse-updates';
import { FollowToggle } from '@/features/stables/components/follow-toggle';
import { HorseUpdatesTimeline } from '@/features/stables/components/horse-updates-timeline';
import { NextEntryCard } from '@/features/stables/components/next-entry-card';
import { PhotoCarousel } from '@/features/stables/components/photo-carousel';
import { ResultRow } from '@/features/stables/components/result-row';
import { StorySection } from '@/features/stables/components/story-section';

type Horse = NonNullable<ReturnType<typeof useHorse>['data']>;

function DetailModules({
  horse,
  nextEntry,
  results,
  horseUpdates,
  onDiscussion,
}: {
  horse: Horse;
  nextEntry: Entry | undefined;
  results: Entry[];
  horseUpdates: HorseUpdate[] | undefined;
  onDiscussion: () => void;
}) {
  return (
    <View className="mb-12 gap-6 px-6">
      {nextEntry && (
        <View className="rounded-2xl bg-card p-6">
          <Text className="mb-4 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Next Up</Text>
          <NextEntryCard entry={nextEntry} />
        </View>
      )}

      {results.length > 0 && (
        <View className="rounded-2xl bg-card p-6">
          <Text className="mb-4 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Recent Results</Text>
          <View className="overflow-hidden">
            {results.map(entry => (
              <ResultRow key={entry.id} entry={entry} />
            ))}
          </View>
        </View>
      )}

      <StorySection story={horse.story} pedigree={horse.pedigree} />

      <HorseUpdatesTimeline updates={horseUpdates} />

      {horse.trainer && (
        <View className="rounded-2xl bg-primary p-6">
          <Text className="mb-2 font-mono text-[10px] font-bold tracking-widest text-on-primary-container uppercase">Trainer</Text>
          <Text className="font-display text-2xl text-on-primary">{horse.trainer.name}</Text>
        </View>
      )}

      {horse.circleSpaceId && (
        <Pressable
          onPress={onDiscussion}
          className="mt-4 items-center rounded-full bg-primary py-4 duration-200 active:scale-95"
        >
          <Text className="font-mono text-sm font-bold tracking-widest text-on-primary uppercase">
            Join the Discussion
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function HorseHero({
  horse,
  isFollowPending,
  onToggleFollow,
}: {
  horse: Horse;
  isFollowPending: boolean;
  onToggleFollow: (following: boolean) => void;
}) {
  return (
    <View className="px-6 pt-8 pb-6">
      <View className="relative mb-6">
        <View className="aspect-4/5 overflow-hidden rounded-2xl bg-muted">
          <PhotoCarousel photos={horse.photos} />
        </View>
        <View className="absolute -right-2 -bottom-6 hidden rounded-xl bg-primary p-6 md:flex">
          <Text className="font-display text-2xl text-on-primary italic">The Jewel of</Text>
          <Text className="font-display text-3xl text-on-primary">Rionna</Text>
        </View>
      </View>
      <View className="mt-8">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
            Equestrian Profile
          </Text>
          <FollowToggle
            isFollowing={horse.isFollowing}
            pending={isFollowPending}
            onToggle={onToggleFollow}
            confirmBeforeUnfollow={horse.inviteOnly ? { horseName: horse.name } : undefined}
          />
        </View>
        <Text className="mb-4 font-display text-6xl text-primary">
          {horse.name}
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-muted px-3 py-1.5">
            <Text className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase">
              {horse.status}
            </Text>
          </View>
          {horse.inviteOnly
            ? (
                <View className="rounded-full bg-muted px-3.5 py-2">
                  <Text className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Private
                  </Text>
                </View>
              )
            : null}
        </View>
        {horse.bio
          ? (
              <Text className="font-display text-xl/relaxed text-muted-foreground">
                {horse.bio}
              </Text>
            )
          : null}
      </View>
    </View>
  );
}

export default function HorseProfileScreen() {
  const params = useLocalSearchParams<{ 'horse-id': string }>();
  const horseId = params['horse-id'];
  const { data: horse, isLoading, isError } = useHorse(horseId);
  const { data: horseUpdates } = useHorseUpdates(horseId);
  const { toggleFollow, pendingHorseId } = useFollowHorse();
  const router = useRouter();
  // Transparent nav header: content must clear the status bar itself.
  const contentPaddingTop = useScreenTopPadding(0);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !horse) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center font-sans text-muted-foreground">
          Horse not found.
        </Text>
      </View>
    );
  }

  const nextEntry = horse.entries?.find(
    e => e.status === 'DECLARED' || e.status === 'ENTERED',
  );
  const results = horse.entries?.filter(e => e.status === 'RAN') ?? [];
  const wins = results.filter(e => e.finishingPosition === 1).length;

  const handleDiscussion = () => {
    if (horse.circleSpaceId) {
      router.push({
        pathname: '/space-feed/[space-id]',
        params: { 'space-id': horse.circleSpaceId, 'name': horse.name },
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingTop: contentPaddingTop }}
    >
      <HorseHero
        horse={horse}
        isFollowPending={pendingHorseId === horse.id}
        onToggleFollow={following => toggleFollow({ horseId: horse.id, following })}
      />

      {/* Stats Grid -- tonal layering, no borders or shadows */}
      <View className="mb-10 flex-row flex-wrap gap-4 px-6">
        <View className="w-[47%] rounded-2xl bg-card p-6">
          <Text className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Total Wins</Text>
          <Text className="font-display text-4xl text-primary">{wins}</Text>
        </View>
        <View className="w-[47%] rounded-2xl bg-card p-6">
          <Text className="mb-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Starts</Text>
          <Text className="font-display text-4xl text-primary">{results.length}</Text>
        </View>
      </View>

      <DetailModules
        horse={horse}
        nextEntry={nextEntry}
        results={results}
        horseUpdates={horseUpdates}
        onDiscussion={handleDiscussion}
      />
    </ScrollView>
  );
}
