import type { HydratedNode } from '@/features/member-content/tiptap/hydrate';

import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '@/components/ui/colors';
import { CircleMediaFrame } from '@/features/member-content/components/circle-media-frame';
import { nonEmptyString, safeExternalUrl } from '@/features/member-content/lib/content-format';

type CircleEmbedBlockProps = {
  node: HydratedNode;
  onOpenUrl?: (url: string) => void;
};

type ResolvedEmbed = {
  html?: unknown;
  url?: unknown;
};

function resolvedEmbed(node: HydratedNode): ResolvedEmbed | null {
  const value = node.attrs?._resolved;
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as ResolvedEmbed
    : null;
}

export function CircleEmbedBlock({ node, onOpenUrl }: CircleEmbedBlockProps) {
  const embed = resolvedEmbed(node);
  const html = nonEmptyString(embed?.html);
  const fallbackUrl = safeExternalUrl(embed?.url);

  if (html) {
    return (
      <CircleMediaFrame
        fragment={html}
        testID="circle-embed-webview"
        onOpenUrl={onOpenUrl}
      />
    );
  }

  if (fallbackUrl) {
    return (
      <Pressable
        accessibilityRole="link"
        disabled={!onOpenUrl}
        style={styles.fallback}
        onPress={() => onOpenUrl?.(fallbackUrl)}
      >
        <Text style={styles.fallbackText}>View media</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.fallback}>
      <Text style={styles.unavailableText}>Media unavailable</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 88,
    padding: 16,
  },
  fallbackText: {
    color: colors.primary,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  unavailableText: {
    color: colors.inkVariant,
    fontSize: 14,
  },
});
