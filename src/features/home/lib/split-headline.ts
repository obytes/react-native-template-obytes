export type SplitHeadline = {
  /** Rendered lilac (the first clause). */
  accent: string;
  /** Rendered white (the rest); empty when the whole headline is lilac. */
  rest: string;
};

/**
 * S13-03 §4: the hero headline is lilac then white, but no field says where
 * the split goes. Rule: the first clause before " for ", ":" or "—" is lilac
 * and the rest white; with no separator the whole headline is lilac.
 * A colon stays with the lilac clause ("Race day:" / "Leopardstown"); " for "
 * and "—" open the white part ("Ashfield Rose declares" / "for Leopardstown").
 */
export function splitHeadline(title: string): SplitHeadline {
  const text = title.trim();
  const candidates = [
    { index: text.indexOf(' for '), keepWithAccent: false },
    { index: text.indexOf(':'), keepWithAccent: true },
    { index: text.indexOf('—'), keepWithAccent: false },
  ].filter(c => c.index > 0);

  if (candidates.length === 0)
    return { accent: text, rest: '' };

  const first = candidates.reduce((a, b) => (b.index < a.index ? b : a));
  const cut = first.keepWithAccent ? first.index + 1 : first.index;
  const accent = text.slice(0, cut).trim();
  const rest = text.slice(cut).trim();
  if (!accent || !rest)
    return { accent: text, rest: '' };
  return { accent, rest };
}
