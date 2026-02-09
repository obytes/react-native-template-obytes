import type { ListRenderItem } from 'react-native';
import type { Course } from './types';
import { FlashList } from '@shopify/flash-list';

import * as React from 'react';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useCourseList } from './api';

function CourseRow({ item }: { item: Course }) {
  const title = item.title_vi ?? item.title;
  return (
    <View className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
      <Text className="text-base text-neutral-900 dark:text-neutral-100">
        {title}
      </Text>
      {item.code
        ? (
            <Text className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {item.code}
            </Text>
          )
        : null}
    </View>
  );
}

export function ShopScreen() {
  const { courses, isLoading, error } = useCourseList();
  const renderItem: ListRenderItem<Course> = React.useCallback(
    ({ item }) => <CourseRow item={item} />,
    [],
  );
  const keyExtractor = React.useCallback(
    (item: Course, index: number) =>
      String(item._id ?? item.id ?? item.code ?? item.title ?? index),
    [],
  );

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1">
        {error
          ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-center text-red-600 dark:text-red-400">
                  Không tải được danh sách khóa học.
                </Text>
              </View>
            )
          : (
              <FlashList
                data={courses}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                estimatedItemSize={56}
                ListEmptyComponent={
                  isLoading
                    ? (
                        <View className="items-center py-8">
                          <Text className="text-neutral-500">Đang tải...</Text>
                        </View>
                      )
                    : (
                        <View className="items-center py-8">
                          <Text className="text-neutral-500">Chưa có khóa học.</Text>
                        </View>
                      )
                }
              />
            )}
      </View>
    </>
  );
}
