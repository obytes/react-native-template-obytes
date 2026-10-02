import * as React from 'react';
import { Text, View } from '@/components/ui';

type ArticleHeaderProps = {
  title: string;
  subtitle: string | null;
  authorName: string | null;
  publishedAt: string;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ArticleHeader({
  title,
  subtitle,
  authorName,
  publishedAt,
}: ArticleHeaderProps) {
  return (
    <View className="gap-2">
      <Text className="font-display text-2xl text-ink">
        {title}
      </Text>
      {subtitle
        ? (
            <Text className="text-base/relaxed text-ink-variant">
              {subtitle}
            </Text>
          )
        : null}
      <View className="flex-row items-center gap-2">
        {authorName
          ? (
              <>
                <Text className="font-sans-medium text-sm text-ink-variant">
                  {authorName}
                </Text>
                <Text className="text-sm text-ink-muted">&middot;</Text>
              </>
            )
          : null}
        <Text className="text-sm text-ink-muted">
          {formatDate(publishedAt)}
        </Text>
      </View>
    </View>
  );
}
