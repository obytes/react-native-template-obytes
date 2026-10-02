import type { Offer, OfferCategory } from '@/features/paddock/types';

import { Image, Pressable, Text, View } from '@/components/ui';

type OfferCardProps = {
  offer: Offer;
  onCopyCode: (code: string) => void;
  onOpenLink: (url: string) => void;
};

const CATEGORY_LABEL: Record<OfferCategory, string> = {
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  lifestyle: 'Lifestyle',
  racing: 'Racing',
  other: 'Partner',
};

function formatValidUntil(iso: string) {
  const d = new Date(iso);
  return `Valid until ${d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function OfferActions({ offer, onCopyCode, onOpenLink }: OfferCardProps) {
  return (
    <View className="gap-3">
      {offer.discountCode
        ? (
            <View className="flex-row items-center justify-between rounded-xl bg-surface-container px-4 py-3">
              <Text selectable className="font-mono text-base tracking-wider text-ink">{offer.discountCode}</Text>
              <Pressable
                testID={`offer-copy-${offer.id}`}
                accessibilityRole="button"
                accessibilityLabel="Copy code"
                onPress={() => onCopyCode(offer.discountCode ?? '')}
                className="rounded-full bg-primary px-4 py-2"
              >
                <Text className="font-sans text-sm font-semibold text-white">Copy</Text>
              </Pressable>
            </View>
          )
        : null}
      {offer.redeemUrl
        ? (
            <Pressable
              testID={`offer-link-${offer.id}`}
              accessibilityRole="link"
              onPress={() => onOpenLink(offer.redeemUrl ?? '')}
              className="items-center rounded-full border border-outline-variant px-4 py-3"
            >
              <Text className="font-sans text-sm font-semibold text-primary">Open offer →</Text>
            </Pressable>
          )
        : null}
      {offer.howToRedeem
        ? <Text className="font-sans text-sm/5 text-ink-variant">{offer.howToRedeem}</Text>
        : null}
    </View>
  );
}

export function OfferCard({ offer, onCopyCode, onOpenLink }: OfferCardProps) {
  return (
    <View testID={`offer-card-${offer.id}`} className="gap-4 overflow-hidden rounded-2xl border border-outline-variant bg-white">
      {offer.imageUrl
        ? (
            <Image
              source={{ uri: `${offer.imageUrl}?width=800&quality=80` }}
              className="aspect-video w-full"
              contentFit="cover"
            />
          )
        : null}
      <View className="gap-3 px-5 pt-1 pb-5">
        <View className="gap-1">
          <Text className="font-mono text-[10px] tracking-widest text-label uppercase">
            {CATEGORY_LABEL[offer.category]}
          </Text>
          <Text className="font-sans text-lg font-semibold text-ink">{offer.title}</Text>
          <Text className="font-sans text-sm text-ink-variant">{offer.partnerName}</Text>
        </View>
        <Text className="font-sans text-sm/5 text-ink-variant">{offer.description}</Text>
        <OfferActions offer={offer} onCopyCode={onCopyCode} onOpenLink={onOpenLink} />
        {offer.validUntil
          ? <Text className="font-mono text-xs text-ink-muted">{formatValidUntil(offer.validUntil)}</Text>
          : null}
      </View>
    </View>
  );
}
