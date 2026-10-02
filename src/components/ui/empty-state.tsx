import type { TileSpec } from '@/components/brand/pattern';
import * as React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { PatternFill } from '@/components/brand/pattern';
import { translate } from '@/lib/i18n';

import { Button } from './button';
import { MonoLabel } from './mono-label';
import { Text } from './text';

const BAND_PATTERN: TileSpec = { kind: 'harlequin', colourway: 'cream', turn: 0 };

export type EmptyStateProps = {
  /** Mono `label-sm` kicker. */
  kicker?: string;
  /** `display-sm` line. */
  title: string;
  body?: string;
  /** Optional secondary action. */
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  className?: string;
  testID?: string;
};

/**
 * Empty state (S13-01 §6): white card with a small cream pattern band, a mono
 * kicker, a `display-sm` line, optional body and an optional secondary
 * button. Per-screen copy lives in the screen tickets' translations.
 */
export function EmptyState({
  kicker,
  title,
  body,
  actionLabel,
  onAction,
  actionLoading,
  className,
  testID,
}: EmptyStateProps) {
  return (
    <View testID={testID} className={twMerge('overflow-hidden rounded-lg bg-white', className)}>
      <PatternFill spec={BAND_PATTERN} tileSize={24} style={{ height: 24 }} />
      <View className="items-start gap-2 p-4">
        {kicker ? <MonoLabel>{kicker}</MonoLabel> : null}
        <Text variant="display-sm" accessibilityRole="header">{title}</Text>
        {body ? <Text variant="body" className="text-ink-variant">{body}</Text> : null}
        {actionLabel && onAction
          ? (
              <Button
                testID={testID ? `${testID}-action` : undefined}
                className="mt-2 self-start"
                variant="secondary"
                size="md"
                fullWidth={false}
                label={actionLabel}
                loading={actionLoading}
                onPress={onAction}
              />
            )
          : null}
      </View>
    </View>
  );
}

export type ErrorStateProps = Omit<EmptyStateProps, 'title' | 'actionLabel' | 'onAction'> & {
  /** Defaults to "Something went wrong". */
  title?: string;
  /** Wire to the query's `refetch`. */
  onRetry: () => void;
  retryLabel?: string;
  /** Show a spinner on the retry button while refetching. */
  retrying?: boolean;
};

/** Error state: the EmptyState layout with a "Try again" button wired to `onRetry`. */
export function ErrorState({ title, onRetry, retryLabel, retrying, ...props }: ErrorStateProps) {
  return (
    <EmptyState
      {...props}
      title={title ?? translate('common.errorTitle')}
      actionLabel={retryLabel ?? translate('common.tryAgain')}
      onAction={onRetry}
      actionLoading={retrying}
    />
  );
}
