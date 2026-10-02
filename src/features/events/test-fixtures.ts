import type { ClubEvent } from '@/features/events/types';

export function clubEvent(overrides: Partial<ClubEvent> = {}): ClubEvent {
  return {
    id: 'event-1',
    spaceId: 'space-1',
    title: 'Autumn Race Day',
    startsAt: '2030-09-05T10:00:00.000Z',
    endsAt: '2030-09-05T12:00:00.000Z',
    locationType: 'in_person',
    inPersonLocation: 'The Curragh',
    virtualLocationUrl: null,
    coverImageUrl: null,
    bodyText: 'Join us for a day at the races.',
    tiptapDoc: null,
    embeds: {},
    inlineAttachments: [],
    url: null,
    rsvp: { going: false, status: null, count: 12, limit: null, disabled: false, full: false },
    ...overrides,
  };
}

export function rsvp(overrides: Partial<ClubEvent['rsvp']> = {}): ClubEvent['rsvp'] {
  return { going: false, status: null, count: 12, limit: null, disabled: false, full: false, ...overrides };
}
