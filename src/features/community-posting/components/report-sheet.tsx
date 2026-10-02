import type { ReportReason, ReportTarget } from '@/features/community-posting/types';
import type { MemberContentScope } from '@/features/member-content/types';

import * as React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import colors from '@/components/ui/colors';
import { Modal, useModal } from '@/components/ui/modal';
import { useReportContent } from '@/features/community-posting/api/use-report-content';

type ReportSheetProps = {
  scope: MemberContentScope;
  /** The post/comment being reported; presents the sheet on every non-null value. */
  target: ReportTarget | null;
  onClose: () => void;
};

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'abusive', label: 'Abusive' },
  { value: 'off_topic', label: 'Off topic' },
  { value: 'other', label: 'Other' },
];

const NOTE_MAX = 500;

function ReportReasonOption({
  reason,
  selected,
  onSelect,
}: {
  reason: { value: ReportReason; label: string };
  selected: boolean;
  onSelect: (value: ReportReason) => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={reason.label}
      onPress={() => onSelect(reason.value)}
      className={`flex-row items-center justify-between border-b border-outline-variant py-3.5 ${
        selected ? 'opacity-100' : 'opacity-80'
      }`}
    >
      <Text className="font-sans text-base text-ink">{reason.label}</Text>
      {selected ? <Text className="font-sans text-sm text-primary">Selected</Text> : null}
    </Pressable>
  );
}

/**
 * Shared report sheet for posts and comments: pick a reason (a note only for
 * "Other"), send via `useReportContent`, and surface the outcome as an
 * alert-based toast since the app has no dedicated toast/snackbar helper.
 */
export function ReportSheet({ scope, target, onClose }: ReportSheetProps) {
  const modal = useModal();
  const { report, isPending } = useReportContent(scope);
  const [reason, setReason] = React.useState<ReportReason>('spam');
  const [note, setNote] = React.useState('');

  const presentRef = React.useRef(modal.present);
  presentRef.current = modal.present;

  React.useEffect(() => {
    if (target) {
      setReason('spam');
      setNote('');
      presentRef.current();
    }
  }, [target]);

  const closeSheet = React.useCallback(() => {
    modal.dismiss();
    onClose();
  }, [modal, onClose]);

  const onSend = React.useCallback(async () => {
    if (!target) {
      return;
    }
    const ok = await report({
      surface: target.surface,
      postId: target.postId,
      commentId: target.commentId,
      spaceId: target.spaceId,
      excerpt: target.excerpt,
      authorName: target.authorName,
      reason,
      note: reason === 'other' ? (note.trim() || undefined) : undefined,
    });
    if (ok) {
      closeSheet();
      Alert.alert('Thanks — the club has been notified.');
    }
    else {
      Alert.alert('Couldn\'t send that report. Try again.');
    }
  }, [target, report, reason, note, closeSheet]);

  return (
    <Modal ref={modal.ref} title="Report" onDismiss={onClose} snapPoints={[reason === 'other' ? '78%' : '62%']}>
      <View className="px-4 pb-6">
        {REASONS.map(item => (
          <ReportReasonOption key={item.value} reason={item} selected={reason === item.value} onSelect={setReason} />
        ))}
        {reason === 'other'
          ? (
              <TextInput
                accessibilityLabel="Report note"
                placeholder="Tell us more (optional)"
                placeholderTextColor={colors.inkMuted}
                value={note}
                onChangeText={setNote}
                maxLength={NOTE_MAX}
                multiline
                textAlignVertical="top"
                className="mt-3 min-h-24 rounded-2xl border border-outline-variant bg-white px-4 py-3 font-sans text-sm text-ink"
              />
            )
          : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send report"
          disabled={isPending}
          onPress={() => void onSend()}
          className={`mt-4 items-center rounded-2xl px-4 py-3 ${isPending ? 'bg-ink-muted' : 'bg-primary'}`}
        >
          <Text className="font-sans-semibold text-base text-white">
            {isPending ? 'Sending…' : 'Send'}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
