import type { TileSpec } from '@/components/brand/pattern';
import type { Poll } from '@/features/polls/types';

import { Card, MonoLabel, Pressable, Text, View } from '@/components/ui';
import { PollResultBar } from '@/features/polls/components/poll-result-bar';
import { percentagesFor } from '@/features/polls/lib/percentages';

const VOTE_PATTERN: TileSpec = { kind: 'harlequin', colourway: 'green', turn: 0 };

type Props = {
  poll: Poll;
  pending: boolean;
  onVote: (pollId: string, optionId: string) => void;
};

function formatVotes(total: number) {
  return `${total} ${total === 1 ? 'vote' : 'votes'}`;
}

/**
 * Charity-screen member vote (frame 15): the poll inline on a sage pattern
 * card. Pre-vote: two-column grid of white checkbox rows. Post-vote: results
 * bars (reusing the polls feature's bar + percentage maths).
 */
export function CharityVoteCard({ poll, pending, onVote }: Props) {
  const canVote = poll.status !== 'closed' && !pending;
  const results = poll.results;
  const percents = results ? percentagesFor(poll.options, results) : null;

  return (
    <Card variant="sage" pattern={VOTE_PATTERN} testID={`poll-card-${poll.id}`} className="gap-6">
      <MonoLabel className="text-forest">Member vote</MonoLabel>
      <Text variant="display-md" className="text-forest">{poll.question}</Text>

      {results
        ? (
            <View className="gap-2">
              {poll.options.map(option => (
                <Pressable
                  key={option.id}
                  testID={`poll-option-${option.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{ selected: poll.myVoteOptionId === option.id, disabled: !canVote }}
                  disabled={!canVote}
                  onPress={() => onVote(poll.id, option.id)}
                  className="rounded-md bg-white px-4 py-3"
                >
                  <PollResultBar
                    label={option.label}
                    percent={percents?.[option.id] ?? 0}
                    mine={poll.myVoteOptionId === option.id}
                    optionId={option.id}
                  />
                </Pressable>
              ))}
            </View>
          )
        : (
            <View className="flex-row flex-wrap gap-1">
              {poll.options.map((option) => {
                const mine = poll.myVoteOptionId === option.id;
                return (
                  <Pressable
                    key={option.id}
                    testID={`poll-option-${option.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: mine, disabled: !canVote }}
                    disabled={!canVote}
                    onPress={() => onVote(poll.id, option.id)}
                    className="min-w-[48%] flex-1 flex-row items-center gap-3 rounded-md bg-white py-2 pr-4 pl-2"
                  >
                    <View className={`size-[15px] rounded-sm ${mine ? 'bg-forest' : 'bg-forest/15'}`} />
                    <Text variant="body-sm" className="flex-1 font-sans-semibold" numberOfLines={2}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

      <Text variant="body-sm" className="text-forest">
        {pending
          ? 'Saving your vote…'
          : results
            ? formatVotes(results.total)
            : 'Tap an option to vote. You can change your mind while the vote is open.'}
      </Text>
    </Card>
  );
}
