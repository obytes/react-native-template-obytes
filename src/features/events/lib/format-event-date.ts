/** "Sat 5 Sep, 11:00" — compact single-line card format (device locale). */
export function formatEventDate(startsAt: string | null): string | null {
  if (!startsAt)
    return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime()))
    return null;
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Location line for cards/detail: address, else "Online", else "Location TBC". */
export function formatEventLocation(event: {
  locationType: string | null;
  inPersonLocation: string | null;
  virtualLocationUrl: string | null;
}): string {
  if (event.inPersonLocation)
    return event.inPersonLocation;
  if (event.locationType === 'virtual')
    return 'Online';
  return 'Location TBC';
}

/** "Sat 4 July · 12:30" -- the card/detail date line (Irish format, 24h). */
export function formatEventDateLine(startsAt: string | null): string | null {
  if (!startsAt)
    return null;
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime()))
    return null;
  const day = new Intl.DateTimeFormat('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(date).replace(/,/g, '');
  const time = new Intl.DateTimeFormat('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return `${day} · ${time}`;
}
