import create from 'zustand';

import { getToken, removeToken, setToken } from './utils';

interface OnboardingState {
  status: 'onboardingEnabled' | 'onboardingDisabled' | 'idle';
  disableOnboarding: () => void;
  enableOnboarding: () => void;
  hydrate: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  status: 'idle',
  disableOnboarding: () => {
    setToken('true');
    set({ status: 'onboardingDisabled' });
  },
  enableOnboarding: () => {
    removeToken();
    set({ status: 'onboardingEnabled' });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      if (userToken !== null) {
        set({ status: 'onboardingDisabled' });
      } else {
        set({ status: 'onboardingEnabled' });
      }
    } catch (e) {
      // catch error here
      set({ status: 'onboardingEnabled' });
    }
  },
}));

export const disableOnboarding = () =>
  useOnboarding.getState().disableOnboarding();
export const hydrateOnboarding = () => useOnboarding.getState().hydrate();
export const enableOnboarding = () =>
  useOnboarding.getState().enableOnboarding();
