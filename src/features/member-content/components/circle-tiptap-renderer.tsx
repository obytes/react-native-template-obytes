import type { TextStyle } from 'react-native';
import type { HydratedNode } from '@/features/member-content/tiptap/hydrate';

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import colors from '@/components/ui/colors';
import { CircleEmbedBlock } from '@/features/member-content/components/circle-embed-block';
import { CircleFileBlock } from '@/features/member-content/components/circle-file-block';
import { CircleImageBlock } from '@/features/member-content/components/circle-image-block';
import { CircleUnsupportedBlock } from '@/features/member-content/components/circle-unsupported-block';
import { nonEmptyString, safeExternalUrl } from '@/features/member-content/lib/content-format';
import { circleDocHasContent } from '@/features/member-content/tiptap/native-support';

export type CircleTiptapRendererProps = {
  doc: HydratedNode | null;
  onOpenUrl?: (url: string) => void;
};

type RenderContext = {
  compactParagraph?: boolean;
  onOpenUrl?: CircleTiptapRendererProps['onOpenUrl'];
};

function nodeKey(parentKey: string, node: HydratedNode, index: number): string {
  const rawIdentity = node.attrs?.id ?? node.attrs?.sgid;
  const identity = typeof rawIdentity === 'number'
    ? String(rawIdentity)
    : nonEmptyString(rawIdentity);
  return `${parentKey}-${node.type ?? 'node'}-${identity ?? index}`;
}

export function CircleTiptapRenderer({
  doc,
  onOpenUrl,
}: CircleTiptapRendererProps) {
  if (!circleDocHasContent(doc))
    return null;

  return (
    <View style={styles.document}>
      {doc.content?.map((node, index) =>
        renderBlock(node, `${index}`, { onOpenUrl }),
      )}
    </View>
  );
}

function renderInline(
  node: HydratedNode,
  key: string,
  onOpenUrl: CircleTiptapRendererProps['onOpenUrl'],
): React.ReactNode {
  if (node.type === 'hardBreak')
    return '\n';
  if (node.type !== 'text') {
    return (
      <Text key={key} style={styles.unsupportedInline}>
        {`[Unsupported content: ${node.type ?? 'unknown'}]`}
      </Text>
    );
  }

  const textStyles: TextStyle[] = [];
  let href: string | null = null;
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold')
      textStyles.push(styles.bold);
    else if (mark.type === 'italic')
      textStyles.push(styles.italic);
    else if (mark.type === 'underline')
      textStyles.push(styles.underline);
    else if (mark.type === 'strike')
      textStyles.push(styles.strike);
    else if (mark.type === 'code')
      textStyles.push(styles.inlineCode);
    else if (mark.type === 'link')
      href = nonEmptyString(mark.attrs?.href);
  }

  const safeHref = safeExternalUrl(href);
  if (safeHref)
    textStyles.push(styles.link);

  return (
    <Text
      key={key}
      accessibilityRole={safeHref ? 'link' : undefined}
      onPress={safeHref && onOpenUrl ? () => onOpenUrl(safeHref) : undefined}
      style={textStyles}
    >
      {node.text ?? ''}
    </Text>
  );
}

function renderInlineChildren(
  node: HydratedNode,
  key: string,
  onOpenUrl: CircleTiptapRendererProps['onOpenUrl'],
) {
  return (node.content ?? []).map((child, index) =>
    renderInline(child, `${key}-${index}`, onOpenUrl),
  );
}

function renderList(
  node: HydratedNode,
  key: string,
  context: RenderContext & { ordered: boolean },
) {
  const rawStart = Number(node.attrs?.start);
  const start = context.ordered && Number.isFinite(rawStart) ? rawStart : 1;

  return (
    <View key={key} style={styles.list}>
      {(node.content ?? []).map((item, index) => (
        <View key={nodeKey(key, item, index)} style={styles.listRow}>
          <Text style={styles.listMarker}>
            {context.ordered ? `${start + index}.` : '•'}
          </Text>
          <View style={styles.listContent}>
            {(item.content ?? []).map((child, childIndex) =>
              renderBlock(child, `${key}-${index}-${childIndex}`, {
                ...context,
                compactParagraph: true,
              }),
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function renderBlock(
  node: HydratedNode,
  key: string,
  context: RenderContext,
): React.ReactNode {
  switch (node.type) {
    case 'paragraph':
      return (
        <Text
          key={key}
          style={[styles.paragraph, context.compactParagraph && styles.compactParagraph]}
        >
          {renderInlineChildren(node, key, context.onOpenUrl)}
        </Text>
      );
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 1), 4);
      return (
        <Text key={key} accessibilityRole="header" style={headingStyles[level]}>
          {renderInlineChildren(node, key, context.onOpenUrl)}
        </Text>
      );
    }
    case 'bulletList':
      return renderList(node, key, { ...context, ordered: false });
    case 'orderedList':
      return renderList(node, key, { ...context, ordered: true });
    case 'listItem':
      return (
        <View key={key}>
          {(node.content ?? []).map((child, index) =>
            renderBlock(child, `${key}-${index}`, context),
          )}
        </View>
      );
    case 'blockquote':
      return (
        <View key={key} style={styles.blockquote}>
          {(node.content ?? []).map((child, index) =>
            renderBlock(child, `${key}-${index}`, context),
          )}
        </View>
      );
    case 'codeBlock':
      return (
        <Text key={key} style={styles.codeBlock}>
          {renderInlineChildren(node, key, context.onOpenUrl)}
        </Text>
      );
    case 'horizontalRule':
      return <View key={key} testID="circle-horizontal-rule" style={styles.horizontalRule} />;
    case 'image':
      return <CircleImageBlock key={key} node={node} />;
    case 'embed':
      return <CircleEmbedBlock key={key} node={node} onOpenUrl={context.onOpenUrl} />;
    case 'file':
      return <CircleFileBlock key={key} node={node} onOpenUrl={context.onOpenUrl} />;
    case 'mention':
    case 'poll':
    case 'entity':
      return <CircleUnsupportedBlock key={key} type={node.type} />;
    case 'hardBreak':
      return <Text key={key}>{'\n'}</Text>;
    case 'text':
      return renderInline(node, key, context.onOpenUrl);
    default:
      return node.content?.length
        ? (
            <View key={key}>
              {node.content.map((child, index) =>
                renderBlock(child, `${key}-${index}`, context),
              )}
            </View>
          )
        : <CircleUnsupportedBlock key={key} type={node.type} />;
  }
}

const styles = StyleSheet.create({
  document: {
    gap: 12,
  },
  paragraph: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  compactParagraph: {
    marginBottom: 0,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    backgroundColor: colors.surfaceContainer,
    fontFamily: 'monospace',
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  list: {
    gap: 6,
  },
  listRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  listMarker: {
    color: colors.inkVariant,
    fontSize: 16,
    lineHeight: 24,
    width: 28,
  },
  listContent: {
    flex: 1,
    gap: 6,
  },
  blockquote: {
    borderLeftColor: colors.outline,
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
  codeBlock: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.ink,
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
  },
  horizontalRule: {
    backgroundColor: colors.outline,
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  unsupportedInline: {
    color: colors.inkVariant,
    fontStyle: 'italic',
  },
});

const headingStyles: Record<number, TextStyle> = {
  1: { color: colors.ink, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  2: { color: colors.ink, fontSize: 24, fontWeight: '700', lineHeight: 30 },
  3: { color: colors.ink, fontSize: 20, fontWeight: '700', lineHeight: 26 },
  4: { color: colors.ink, fontSize: 18, fontWeight: '700', lineHeight: 24 },
};
