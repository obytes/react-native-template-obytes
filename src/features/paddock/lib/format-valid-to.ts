const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "Valid to September" from an ISO date, or null when absent/invalid. */
export function formatValidTo(iso: string | null): string | null {
  if (!iso)
    return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()))
    return null;
  return `Valid to ${MONTHS[d.getUTCMonth()]}`;
}
