import type { MonthRef } from '@/features/events/lib/calendar-grid';

import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { CaretRightV2 } from '@/components/ui/icons/v2';
import { buildMonthGrid } from '@/features/events/lib/calendar-grid';
import { translate } from '@/lib/i18n';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FLIP = { transform: [{ rotate: '180deg' }] };

export type MonthCalendarProps = {
  month: MonthRef;
  /** Day key (`YYYY-MM-DD`) -> fill colour for days with events. */
  eventDays: ReadonlyMap<string, string>;
  /** Injectable for tests/stories; defaults to now. */
  today?: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (dayKey: string) => void;
  testID?: string;
};

function monthTitle(ref: MonthRef) {
  return new Intl.DateTimeFormat('en-IE', { month: 'long', year: 'numeric' })
    .format(new Date(ref.year, ref.month, 1));
}

/**
 * Pure month grid (no calendar library): Monday start, out-of-month days
 * muted @40%, today = 1pt navy outlined r8 square, event days = r8 filled
 * square. Layout/marking logic lives in lib/calendar-grid.ts.
 */
export function MonthCalendar({
  month,
  eventDays,
  today,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  testID = 'month-calendar',
}: MonthCalendarProps) {
  const weeks = React.useMemo(() => buildMonthGrid(month, today), [month, today]);

  return (
    <Card testID={testID}>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          testID={`${testID}-prev`}
          accessibilityRole="button"
          accessibilityLabel={translate('events.prevMonth')}
          onPress={onPrevMonth}
          className="size-11 items-center justify-center"
        >
          <CaretRightV2 size={20} color={colors.ink} style={FLIP} />
        </Pressable>
        <Text variant="body-sm" className="text-ink-variant" testID={`${testID}-title`}>
          {monthTitle(month)}
        </Text>
        <Pressable
          testID={`${testID}-next`}
          accessibilityRole="button"
          accessibilityLabel={translate('events.nextMonth')}
          onPress={onNextMonth}
          className="size-11 items-center justify-center"
        >
          <CaretRightV2 size={20} color={colors.ink} />
        </Pressable>
      </View>

      <View className="mb-2 flex-row">
        {WEEKDAYS.map((label, i) => (
          // eslint-disable-next-line react/no-array-index-key -- fixed 7 columns, letters repeat
          <View key={i} className="flex-1 items-center">
            <Text variant="label-sm" accessibilityElementsHidden importantForAccessibility="no">
              {label}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map(week => (
        <View key={week[0].key} className="flex-row">
          {week.map((cell) => {
            const fill = eventDays.get(cell.key);
            return (
              <View key={cell.key} className="flex-1 items-center py-1">
                <Pressable
                  testID={`${testID}-day-${cell.key}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.key}${fill ? ', has events' : ''}${cell.isToday ? ', today' : ''}`}
                  onPress={() => onSelectDay(cell.key)}
                  className={`size-10 items-center justify-center rounded-lg ${cell.isToday ? 'border border-primary' : ''}`}
                  style={fill ? { backgroundColor: fill } : undefined}
                >
                  <Text
                    variant="body"
                    className={cell.inMonth ? 'text-ink' : 'text-ink opacity-40'}
                  >
                    {cell.day}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </Card>
  );
}
