import * as React from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Submark } from '@/components/brand/logo';
import { translate } from '@/lib/i18n';

import colors from './colors';
import { CaretRightV2 } from './icons/v2';
import { MonoLabel } from './mono-label';
import { useScreenTopPadding } from './screen-layout';
import { Text } from './text';

const BACK_ICON_STYLE = { transform: [{ rotate: '180deg' }] };

export type ScreenHeaderProps = {
  /**
   * `kicker`: centred mono kicker ("SHOP", "PROFILE") with a back chevron,
   * then an optional `display-lg` title below.
   * `tab-root`: tab screen header: the submark (`brand`) or a `display-lg`
   * title on the left, an optional `right` slot (e.g. the avatar).
   */
  variant?: 'kicker' | 'tab-root';
  kicker?: string;
  title?: string;
  subtitle?: string;
  /** `tab-root`: show the submark instead of the title row (Home). */
  brand?: boolean;
  /** `kicker`: back handler; the chevron only renders when set. */
  onBack?: () => void;
  backLabel?: string;
  right?: React.ReactNode;
  /** `dark` for navy/photo backgrounds. */
  tone?: 'light' | 'dark';
  /** Add the status-bar inset as top padding (default true). */
  safeArea?: boolean;
  className?: string;
  testID?: string;
};

function BackButton({ onBack, label, color, testID }: { onBack: () => void; label: string; color: string; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="size-11 items-center justify-center"
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
    >
      <CaretRightV2 size={20} color={color} style={BACK_ICON_STYLE} />
    </Pressable>
  );
}

function KickerRow({ kicker, onBack, backLabel, right, tone, testID }: ScreenHeaderProps) {
  const dark = tone === 'dark';
  return (
    <View className="h-11 flex-row items-center">
      <View className="-ml-3 w-11">
        {onBack && (
          <BackButton
            onBack={onBack}
            label={backLabel ?? translate('common.back')}
            color={dark ? colors.white : colors.ink}
            testID={testID ? `${testID}-back` : undefined}
          />
        )}
      </View>
      <View className="flex-1 items-center">
        {kicker
          ? (
              <MonoLabel size="md" tone={dark ? 'dark' : 'light'} accessibilityRole="header" className={dark ? '' : 'text-ink'}>
                {kicker}
              </MonoLabel>
            )
          : null}
      </View>
      <View className="-mr-3 w-11 items-end">{right}</View>
    </View>
  );
}

function TitleBlock({ title, subtitle, tone }: Pick<ScreenHeaderProps, 'title' | 'subtitle' | 'tone'>) {
  const dark = tone === 'dark';
  return (
    <View className="gap-2">
      {title
        ? (
            <Text variant="display-lg" accessibilityRole="header" className={dark ? 'text-on-primary' : ''}>
              {title}
            </Text>
          )
        : null}
      {subtitle
        ? <Text variant="body" className={dark ? 'text-on-primary' : ''}>{subtitle}</Text>
        : null}
    </View>
  );
}

/** Screen header in the two V2 patterns (S13-01 §7). Safe-area aware. */
export function ScreenHeader(props: ScreenHeaderProps) {
  const { variant = 'kicker', title, subtitle, brand, right, tone, safeArea = true, className, testID } = props;
  const topPadding = useScreenTopPadding();
  const style = safeArea ? { paddingTop: topPadding } : undefined;

  if (variant === 'tab-root') {
    return (
      <View testID={testID} style={style} className={twMerge('gap-8 px-4', className)}>
        {(brand || right) && (
          <View className="min-h-11 flex-row items-center justify-between">
            {brand ? <Submark width={36} color={tone === 'dark' ? colors.white : colors.ink} /> : <View />}
            {right}
          </View>
        )}
        {(title || subtitle) && <TitleBlock title={title} subtitle={subtitle} tone={tone} />}
      </View>
    );
  }

  return (
    <View testID={testID} style={style} className={twMerge('gap-6 px-4', className)}>
      <KickerRow {...props} />
      {(title || subtitle) && <TitleBlock title={title} subtitle={subtitle} tone={tone} />}
    </View>
  );
}
