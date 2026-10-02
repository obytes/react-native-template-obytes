import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';

import {
  ActivityIndicator,
  ErrorState,
  FocusAwareStatusBar,
  ScreenHeader,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { ArticleContent } from '@/features/news-detail/components/article-content';
import { ArticleHero } from '@/features/news-detail/components/article-hero';
import { useNewsPost } from '@/features/pulse/api/use-news-post';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function NewsDetailScreen() {
  const params = useLocalSearchParams<{ 'news-post-id': string }>();
  const router = useRouter();
  const slug = params['news-post-id'];
  const { data: post, isLoading, isError, refetch, isRefetching } = useNewsPost(slug ?? '');
  const goBack = () => router.back();

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <View className="items-center py-24">
        <ActivityIndicator />
      </View>
    );
  }
  else if (isError || !post) {
    content = (
      <View className="px-4 pt-6">
        <ErrorState
          testID="news-error"
          title="Article not found"
          body="It may have been removed, or your connection dropped."
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      </View>
    );
  }
  else {
    content = (
      <>
        <ArticleHero
          title={post.title}
          imageUrl={post.featuredImageUrl}
          dateLabel={formatDate(post.publishedAt)}
          onBack={goBack}
        />
        <View className="gap-4 px-4 pt-6 pb-12">
          {post.subtitle ? <Text variant="body-lg" className="text-ink-variant">{post.subtitle}</Text> : null}
          {post.author?.name
            ? <Text variant="body-sm" className="text-ink-muted">{`By ${post.author.name}`}</Text>
            : null}
          <ArticleContent html={post.contentHtml} />
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-secondary-container">
      <Stack.Screen options={{ headerShown: false }} />
      <FocusAwareStatusBar barStyle={post ? 'light' : 'dark'} />
      {post ? null : <ScreenHeader kicker="News" onBack={goBack} />}
      <ScrollView className="flex-1" contentInsetAdjustmentBehavior="never">
        {content}
      </ScrollView>
    </View>
  );
}
