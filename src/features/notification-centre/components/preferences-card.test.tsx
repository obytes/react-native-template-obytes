import { render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { PreferencesCard } from '@/features/notification-centre/components/preferences-card';

let mockPrefs: unknown;
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/features/settings/api/use-preferences', () => ({
  usePreferences: () => ({ data: mockPrefs }),
  useUpdatePreferences: () => ({ mutate: jest.fn() }),
}));

const KEY = 'inbox-pref-settings.notifications.trainerUpdates';

describe('preferencesCard', () => {
  it('shows inline toggles off and disabled when the master push switch is off', () => {
    mockPrefs = { pushEnabled: false, pushPreferences: { horseUpdates: true }, emailPreferences: {} };
    render(<PreferencesCard />);
    expect(screen.getByTestId(KEY).props.value).toBe(false);
    expect(screen.getByTestId(KEY).props.disabled).toBe(true);
  });

  it('reflects the stored value when the master switch is on', () => {
    mockPrefs = { pushEnabled: true, pushPreferences: { horseUpdates: true }, emailPreferences: {} };
    render(<PreferencesCard />);
    expect(screen.getByTestId(KEY).props.value).toBe(true);
    expect(screen.queryByTestId(KEY).props.disabled).toBeFalsy();
  });
});
