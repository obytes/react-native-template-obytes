import type { PostImage } from '@/features/community-posting/types';

import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Image } from '@/components/ui';

type ComposeImageRowProps = {
  image: PostImage | null;
  imageError: string | null;
  onPickImage: () => void;
  onRemoveImage: () => void;
};

/**
 * Add-photo affordance for the composer: an "Add photo" trigger before an
 * image is picked, a thumbnail with a remove (×) control once one is, and
 * the 10 MB guard message below either state.
 */
export function ComposeImageRow({ image, imageError, onPickImage, onRemoveImage }: ComposeImageRowProps) {
  return (
    <View className="gap-2">
      {image
        ? (
            <View className="relative self-start">
              <Image source={{ uri: image.uri }} className="size-24 rounded-xl" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={onRemoveImage}
                className="absolute -top-2 -right-2 size-6 items-center justify-center rounded-full bg-primary"
              >
                <Text className="font-sans-semibold text-xs text-white">×</Text>
              </Pressable>
            </View>
          )
        : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add photo"
              onPress={onPickImage}
              className="self-start rounded-2xl border border-dashed border-outline-variant px-4 py-3"
            >
              <Text className="font-sans-medium text-sm text-ink-variant">Add photo</Text>
            </Pressable>
          )}
      {imageError
        ? <Text className="font-sans text-xs text-danger-700">{imageError}</Text>
        : null}
    </View>
  );
}
