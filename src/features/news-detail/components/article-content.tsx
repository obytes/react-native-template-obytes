import type { ArticleBlock, Inline } from '@/features/news-detail/lib/parse-article-html';

import * as React from 'react';

import { Image, Text, View } from '@/components/ui';
import { parseArticleHtml } from '@/features/news-detail/lib/parse-article-html';
import { openExternalLink } from '@/lib/open-external-link';

function Inlines({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((inline, i) => {
        const classes = [
          inline.bold ? 'font-sans-bold' : '',
          inline.italic ? 'italic' : '',
          inline.href ? 'text-plum-mid underline' : '',
        ].filter(Boolean).join(' ');
        return (
          <Text
            // Inline runs have no stable id; order is fixed per render.
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={classes}
            onPress={inline.href ? () => openExternalLink(inline.href!) : undefined}
            accessibilityRole={inline.href ? 'link' : undefined}
          >
            {inline.text}
          </Text>
        );
      })}
    </>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text variant="display-sm" accessibilityRole="header" className="mt-2">
          <Inlines inlines={block.inlines} />
        </Text>
      );
    case 'quote':
      return (
        <View testID="article-quote" className="border-l-2 border-primary-fixed pl-4">
          <Text variant="body-lg" className="italic">
            <Inlines inlines={block.inlines} />
          </Text>
        </View>
      );
    case 'list-item':
      return (
        <View className="flex-row gap-2 pl-2">
          <Text variant="body-lg">•</Text>
          <Text variant="body-lg" className="flex-1">
            <Inlines inlines={block.inlines} />
          </Text>
        </View>
      );
    case 'image':
      return (
        <Image
          source={{ uri: block.src }}
          accessibilityLabel={block.alt}
          className="aspect-video w-full rounded-lg"
          contentFit="cover"
          fallback={{ colourway: 'cream' }}
        />
      );
    default:
      return (
        <Text variant="body-lg">
          <Inlines inlines={block.inlines} />
        </Text>
      );
  }
}

/** News body in the V2 type ramp: h2 `display-sm`, p `body-lg`, plum-mid links, lilac-ruled quotes. */
export function ArticleContent({ html }: { html: string }) {
  const blocks = React.useMemo(() => parseArticleHtml(html), [html]);
  return (
    <View testID="article-content" className="gap-4">
      {blocks.map((block, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Block key={i} block={block} />
      ))}
    </View>
  );
}
