import type { PostableSpace } from '@/features/community-posting/types';

import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Pressable, Text, useWindowDimensions } from 'react-native';

import { Modal, useModal } from '@/components/ui/modal';

type SpacePickerSheetProps = {
  spaces: PostableSpace[];
  selectedSpaceId: string | null;
  onSelect: (space: PostableSpace) => void;
};

/**
 * Space selector for the composer: a trigger showing the currently chosen
 * space, opening a `@gorhom/bottom-sheet` list of every postable space.
 */
export function SpacePickerSheet({ spaces, selectedSpaceId, onSelect }: SpacePickerSheetProps) {
  const modal = useModal();
  const selected = spaces.find(space => space.id === selectedSpaceId) ?? null;

  const onSelectSpace = React.useCallback(
    (space: PostableSpace) => {
      onSelect(space);
      modal.dismiss();
    },
    [onSelect, modal],
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose space"
        onPress={modal.present}
        testID="compose-post-space-trigger"
        className="mb-4 flex-row items-center justify-between rounded-2xl border border-outline-variant bg-white px-4 py-3"
      >
        <Text className="font-sans text-base font-medium text-ink">
          {selected ? `${selected.emoji ?? ''} ${selected.name}`.trim() : 'Choose a space'}
        </Text>
        <Text className="font-sans text-sm text-primary">Change</Text>
      </Pressable>
      <SpacePickerOptions
        ref={modal.ref}
        spaces={spaces}
        selectedSpaceId={selectedSpaceId}
        onSelect={onSelectSpace}
      />
    </>
  );
}

function keyExtractor(space: PostableSpace) {
  return space.id;
}

function SpacePickerOptions({
  ref,
  spaces,
  selectedSpaceId,
  onSelect,
}: SpacePickerSheetProps & { ref: React.ComponentProps<typeof Modal>['ref'] }) {
  const { height: windowHeight } = useWindowDimensions();
  // Header + rows, clamped so a long space list scrolls inside the sheet
  // instead of pushing the top row off screen.
  const height = Math.min(spaces.length * 60 + 160, Math.round(windowHeight * 0.75));
  const snapPoints = React.useMemo(() => [height], [height]);

  const renderItem = React.useCallback(
    ({ item }: { item: PostableSpace }) => (
      <SpaceOption space={item} selected={item.id === selectedSpaceId} onPress={() => onSelect(item)} />
    ),
    [selectedSpaceId, onSelect],
  );

  return (
    <Modal ref={ref} title="Choose a space" index={0} snapPoints={snapPoints}>
      <BottomSheetFlatList data={spaces} keyExtractor={keyExtractor} renderItem={renderItem} />
    </Modal>
  );
}

function SpaceOption({
  space,
  selected,
  onPress,
}: {
  space: PostableSpace;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={space.name}
      onPress={onPress}
      testID={`compose-post-space-${space.id}`}
      className="flex-row items-center border-b border-outline-variant px-4 py-3"
    >
      <Text className="flex-1 font-sans text-base text-ink">
        {space.emoji ? `${space.emoji} ` : ''}
        {space.name}
      </Text>
      {selected ? <Text className="font-sans text-sm text-primary">Selected</Text> : null}
    </Pressable>
  );
}
