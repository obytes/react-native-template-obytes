import type { PostImage } from '@/features/community-posting/types';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Button, Image, Text } from '@/components/ui';

type ComposeImageRowProps = {
  image: PostImage | null;
  imageError: string | null;
  onPickImage: () => void;
  onRemoveImage: () => void;
};

/**
 * Add-photo affordance for the composer: an "Add photo" trigger before an
 * image is picked, a thumbnail with a remove (x) control once one is, and
 * the 10 MB guard message below either state.
 */
export function ComposeImageRow({ image, imageError, onPickImage, onRemoveImage }: ComposeImageRowProps) {
  return (
    <View className="gap-2">
      {image
        ? (
            <View className="relative self-start">
              <Image source={{ uri: image.uri }} className="size-24 rounded-lg" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={onRemoveImage}
                hitSlop={8}
                className="absolute -top-2 -right-2 size-6 items-center justify-center rounded-full bg-primary"
              >
                <Text variant="body-sm" className="font-sans-semibold text-white">×</Text>
              </Pressable>
            </View>
          )
        : (
            <Button
              variant="secondary"
              size="md"
              fullWidth={false}
              label="Add photo"
              onPress={onPickImage}
            />
          )}
      {imageError
        ? <Text variant="body-sm" className="text-plum">{imageError}</Text>
        : null}
    </View>
  );
}
