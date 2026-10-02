import type { HydratedNode } from '@/features/member-content/tiptap/hydrate';

import * as React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import colors from '@/components/ui/colors';
import { CircleMediaFrame } from '@/features/member-content/components/circle-media-frame';
import { CircleUnsupportedBlock } from '@/features/member-content/components/circle-unsupported-block';
import { nonEmptyString, safeExternalUrl } from '@/features/member-content/lib/content-format';

type CircleFileBlockProps = {
  node: HydratedNode;
  onOpenUrl?: (url: string) => void;
};

type ResolvedFile = {
  url?: unknown;
  download_url?: unknown;
  content_type?: unknown;
  filename?: unknown;
};

function resolvedFile(node: HydratedNode): ResolvedFile | null {
  const value = node.attrs?._resolved;
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as ResolvedFile
    : null;
}

function isVideoContent(url: string, contentType: string | null): boolean {
  if (contentType?.toLowerCase().startsWith('video/'))
    return true;
  return /\.(mov|mp4|m4v|webm|ogv)(\?|#|$)/i.test(url);
}

function escapeHtmlAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Circle `file` block — since the iPhone-Safari admin fix, native video
 * uploads publish as `file` blocks (not oEmbed embeds), so the common case
 * here is a club video: play it inline via the sandboxed media frame.
 * Anything else renders as a link that opens externally.
 */
export function CircleFileBlock({ node, onOpenUrl }: CircleFileBlockProps) {
  const file = resolvedFile(node);
  const src = safeExternalUrl(file?.url)
    ?? safeExternalUrl(node.attrs?.url)
    ?? safeExternalUrl(file?.download_url);
  const contentType = nonEmptyString(file?.content_type)
    ?? nonEmptyString(node.attrs?.content_type)
    ?? nonEmptyString(node.attrs?.contentType);

  if (!src)
    return <CircleUnsupportedBlock type="file" />;

  if (isVideoContent(src, contentType)) {
    return (
      <CircleMediaFrame
        fragment={`<video src="${escapeHtmlAttr(src)}" controls playsinline preload="metadata"></video>`}
        testID="circle-file-webview"
        onOpenUrl={onOpenUrl}
      />
    );
  }

  const name = nonEmptyString(file?.filename)
    ?? nonEmptyString(node.attrs?.filename)
    ?? 'Download file';

  return (
    <Pressable
      accessibilityRole="link"
      disabled={!onOpenUrl}
      style={styles.fileLink}
      onPress={() => onOpenUrl?.(src)}
    >
      <Text style={styles.fileLinkText}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fileLink: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minHeight: 56,
    padding: 16,
  },
  fileLinkText: {
    color: colors.primary,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
