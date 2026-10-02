import * as React from 'react';
import { Text, View } from '@/components/ui';

type ArticleBodyProps = {
  contentHtml: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function ArticleBody({ contentHtml }: ArticleBodyProps) {
  const plainText = React.useMemo(() => stripHtml(contentHtml), [contentHtml]);

  return (
    <View className="mt-2">
      <Text className="text-base/relaxed text-ink">
        {plainText}
      </Text>
    </View>
  );
}
