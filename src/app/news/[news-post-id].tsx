import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from '@/components/ui';
import { useNewsPost } from '@/features/pulse/api/use-news-post';

import { ArticleBody } from '@/features/pulse/components/article-body';
import { ArticleHeader } from '@/features/pulse/components/article-header';

export default function NewsPostScreen() {
  const params = useLocalSearchParams<{ 'news-post-id': string }>();
  const slug = params['news-post-id'];
  const { data: post, isLoading, isError } = useNewsPost(slug ?? '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center text-ink-muted">
          Article not found.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {post.featuredImageUrl
        ? (
            <Image
              source={{
                uri: `${post.featuredImageUrl}?width=800&quality=80`,
              }}
              className="aspect-video w-full"
              contentFit="cover"
            />
          )
        : null}

      <View className="gap-4 p-4">
        <ArticleHeader
          title={post.title}
          subtitle={post.subtitle}
          authorName={post.author?.name ?? null}
          publishedAt={post.publishedAt}
        />
        <ArticleBody contentHtml={post.contentHtml} />
      </View>
    </ScrollView>
  );
}
