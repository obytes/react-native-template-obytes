import type { PressableProps, View } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import * as React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { tv } from 'tailwind-variants';

import colors from './colors';
import { minHitSlop } from './hit-slop';
import { Text } from './text';

/**
 * Design V2 button (S13-01 §7). Variants come from the Figma `Button L/M/S`
 * components; sizes L 45h r8 `title`, M 30h r6 SemiBold 12, S 27h r4
 * SemiBold 12. No motion here: press feedback is plain opacity (S14 adds the
 * press scale).
 *
 * Legacy variant names stay accepted so existing callers keep working:
 * `default` → `primary`, `outline` → `secondary`. `ghost`/`link` are
 * text-only buttons on light surfaces.
 */
const button = tv({
  slots: {
    container: 'flex-row items-center justify-center',
    label: 'text-center',
  },
  variants: {
    variant: {
      'primary': { container: 'bg-primary', label: 'text-on-primary' },
      'default': { container: 'bg-primary', label: 'text-on-primary' },
      'secondary': { container: 'border border-primary bg-white', label: 'text-ink' },
      'outline': { container: 'border border-primary bg-white', label: 'text-ink' },
      'accent': { container: 'bg-primary-fixed', label: 'text-plum' },
      'on-dark': { container: 'bg-white', label: 'text-ink' },
      'ghost-on-dark': { container: 'border border-white bg-transparent', label: 'text-white' },
      'destructive': { container: 'bg-plum', label: 'text-on-primary' },
      'ghost': { container: 'bg-transparent', label: 'text-ink underline' },
      'link': { container: 'bg-transparent', label: 'text-ink' },
    },
    size: {
      lg: { container: 'h-[45px] rounded-lg px-[26px]' },
      default: { container: 'h-[45px] rounded-lg px-[26px]' },
      md: { container: 'h-[30px] rounded-md px-4', label: 'font-semibold' },
      sm: { container: 'h-[27px] rounded-sm px-3', label: 'font-semibold' },
    },
    disabled: {
      true: { container: 'opacity-40' },
    },
    fullWidth: {
      true: { container: '' },
      false: { container: 'self-center' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    disabled: false,
    fullWidth: true,
    size: 'lg',
  },
});

type ButtonVariants = VariantProps<typeof button>;
export type ButtonVariant = NonNullable<ButtonVariants['variant']>;
export type ButtonSize = NonNullable<ButtonVariants['size']>;

const SIZE_HEIGHT: Record<ButtonSize, number> = { lg: 45, default: 45, md: 30, sm: 27 };

const INDICATOR_COLOR: Record<ButtonVariant, string> = {
  'primary': colors.onPrimary,
  'default': colors.onPrimary,
  'secondary': colors.ink,
  'outline': colors.ink,
  'accent': colors.plum,
  'on-dark': colors.ink,
  'ghost-on-dark': colors.white,
  'destructive': colors.onPrimary,
  'ghost': colors.ink,
  'link': colors.ink,
};

type Props = {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
} & ButtonVariants & Omit<PressableProps, 'disabled'>;

export function Button({
  ref,
  label: text,
  loading = false,
  variant = 'primary',
  disabled = false,
  size = 'lg',
  fullWidth = true,
  className = '',
  testID,
  textClassName = '',
  ...props
}: Props & { ref?: React.RefObject<View | null> }) {
  const styles = React.useMemo(
    () => button({ variant, disabled, size, fullWidth }),
    [variant, disabled, size, fullWidth],
  );
  const v = variant ?? 'primary';
  const s = size ?? 'lg';
  const isLarge = s === 'lg' || s === 'default';
  const isDisabled = Boolean(disabled) || loading;

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={minHitSlop(SIZE_HEIGHT[s])}
      className={styles.container({ className })}
      style={({ pressed }) => (pressed && !isDisabled ? { opacity: 0.7 } : null)}
      {...props}
      ref={ref}
      testID={testID}
    >
      {props.children
        ? (
            props.children as React.ReactNode
          )
        : loading
          ? (
              <ActivityIndicator
                size="small"
                color={INDICATOR_COLOR[v]}
                testID={testID ? `${testID}-activity-indicator` : undefined}
              />
            )
          : (
              <Text
                variant={isLarge ? 'title' : 'body-sm'}
                testID={testID ? `${testID}-label` : undefined}
                className={styles.label({ className: textClassName })}
                numberOfLines={1}
              >
                {text}
              </Text>
            )}
    </Pressable>
  );
}
