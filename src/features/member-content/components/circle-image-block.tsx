import type { DimensionValue } from 'react-native';
import type { HydratedNode } from '@/features/member-content/tiptap/hydrate';

import { Image } from 'expo-image';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import colors from '@/components/ui/colors';
import { nonEmptyString } from '@/features/member-content/lib/content-format';

type CircleImageBlockProps = {
  node: HydratedNode;
};

function imageWidth(value: unknown): DimensionValue {
  if (value === '50%' || value === '100%')
    return value;
  return '100%';
}

function imageAlignment(value: unknown) {
  if (value === 'left')
    return 'flex-start' as const;
  if (value === 'right')
    return 'flex-end' as const;
  return 'center' as const;
}

export function CircleImageBlock({ node }: CircleImageBlockProps) {
  const uri = nonEmptyString(node.attrs?.url) ?? nonEmptyString(node.attrs?.src);
  if (!uri)
    return null;

  const layoutStyle = {
    alignSelf: imageAlignment(node.attrs?.alignment),
    width: imageWidth(node.attrs?.width),
  };

  return (
    <View testID="circle-image" style={layoutStyle}>
      <Image
        testID="circle-image-content"
        accessibilityLabel={nonEmptyString(node.attrs?.alt) ?? undefined}
        cachePolicy="memory-disk"
        contentFit="contain"
        source={{ uri }}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 8,
    width: '100%',
  },
});
