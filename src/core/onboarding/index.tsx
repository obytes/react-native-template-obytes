import create from 'zustand';

import { getToken, removeToken, setToken } from './utils';

interface OnboardingState {
  status: 'onboardingEnabled' | 'onboardingDisabled' | 'idle';
  setOnboarding: () => void;
  enableOnboarding: () => void;
  hydrate: () => void;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  status: 'idle',
  setOnboarding: () => {
    setToken('true');
    set({ status: 'onboardingDisabled' });
  },
  enableOnboarding: () => {
    removeToken();
    set({ status: 'onboardingDisabled' });
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
    }
  },
}));

export const setOnboarding = () => useOnboarding.getState().setOnboarding();
export const hydrateOnboarding = () => useOnboarding.getState().hydrate();
export const enableOnboarding = () =>
  useOnboarding.getState().enableOnboarding();
