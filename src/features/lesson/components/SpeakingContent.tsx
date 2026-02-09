import * as React from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import type { LessonSpeaking } from '@/features/lesson/api';

type Props = { speakings: LessonSpeaking[] };

function SpeakingDialogueCard({ speaking }: { speaking: LessonSpeaking }) {
  const title = (speaking.title ?? '').trim() || 'Dialogue';
  const imageUrl = (speaking.image_url ?? '').trim();
  const audioEnUrl = (speaking.audio_en_url ?? '').trim();
  const blocks = speaking.blocks ?? [];
  const sentences = blocks[0]?.sentences ?? [];

  const playAudio = () => {
    if (audioEnUrl) Linking.openURL(audioEnUrl);
  };

  return (
    <View className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <Text className="px-4 pt-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="mt-2 h-40 w-full bg-neutral-100 dark:bg-neutral-800"
          resizeMode="cover"
        />
      ) : null}
      {audioEnUrl ? (
        <Pressable
          onPress={playAudio}
          className="mx-4 mt-3 flex-row items-center justify-center rounded-lg bg-primary-500 py-2.5 active:opacity-80"
        >
          <Text className="text-sm font-medium text-white">Phát audio</Text>
        </Pressable>
      ) : null}
      <View className="px-4 pb-4 pt-3">
        {sentences.length ? (
          sentences.map((s, i) => (
            <View key={i} className="mb-2">
              {s.speaker ? (
                <Text className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  {s.speaker}
                </Text>
              ) : null}
              <Text className="text-neutral-800 dark:text-neutral-200">
                {s.text_en ?? s.text_vi ?? ''}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-neutral-500 dark:text-neutral-400">
            Chưa có nội dung dialogue.
          </Text>
        )}
      </View>
    </View>
  );
}

export function SpeakingContent({ speakings }: Props) {
  if (!speakings.length) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-neutral-500 dark:text-neutral-400">
          Chưa có bài speaking trong lesson này.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator
    >
      {speakings.map((s) => (
        <SpeakingDialogueCard key={s.id ?? s.title ?? String(s)} speaking={s} />
      ))}
    </ScrollView>
  );
}
