import type { PressableProps, View } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import * as React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { tv } from 'tailwind-variants';

const button = tv({
  slots: {
    container: 'my-2 flex flex-row items-center justify-center rounded-full px-4',
    label: 'font-mono text-base font-medium tracking-widest uppercase',
    indicator: 'h-6 text-on-primary',
  },

  variants: {
    variant: {
      default: {
        container: 'bg-primary shadow-sm',
        label: 'text-on-primary',
        indicator: 'text-on-primary',
      },
      secondary: {
        container: 'bg-surface-container-high',
        label: 'text-primary',
        indicator: 'text-primary',
      },
      outline: {
        container: 'border border-outline-variant bg-transparent',
        label: 'text-ink',
        indicator: 'text-ink',
      },
      destructive: {
        container: 'bg-danger-700',
        label: 'text-white',
        indicator: 'text-white',
      },
      ghost: {
        container: 'bg-transparent',
        label: 'text-ink underline',
        indicator: 'text-ink',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-ink',
        indicator: 'text-ink',
      },
    },
    size: {
      default: {
        container: 'h-10 px-4',
        label: 'text-base',
      },
      lg: {
        container: 'h-12 px-8',
        label: 'text-xl',
      },
      sm: {
        container: 'h-8 px-3',
        label: 'text-sm',
        indicator: 'h-2',
      },
      icon: { container: 'size-9' },
    },
    disabled: {
      true: {
        container: 'bg-surface-container',
        label: 'text-ink-variant',
        indicator: 'text-ink-variant',
      },
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
type Props = {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
} & ButtonVariants & Omit<PressableProps, 'disabled'>;

export function Button({ ref, label: text, loading = false, variant = 'default', disabled = false, size = 'default', className = '', testID, textClassName = '', ...props }: Props & { ref?: React.RefObject<View | null> }) {
  const styles = React.useMemo(
    () => button({ variant, disabled, size }),
    [variant, disabled, size],
  );

  return (
    <Pressable
      disabled={disabled || loading}
      className={styles.container({ className })}
      {...props}
      ref={ref}
      testID={testID}
    >
      {props.children
        ? (
            props.children
          )
        : (
            <>
              {loading
                ? (
                    <ActivityIndicator
                      size="small"
                      className={styles.indicator()}
                      testID={testID ? `${testID}-activity-indicator` : undefined}
                    />
                  )
                : (
                    <Text
                      testID={testID ? `${testID}-label` : undefined}
                      className={styles.label({ className: textClassName })}
                    >
                      {text}
                    </Text>
                  )}
            </>
          )}
    </Pressable>
  );
}
