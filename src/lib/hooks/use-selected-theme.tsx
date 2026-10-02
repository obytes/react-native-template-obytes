import { Uniwind } from 'uniwind';

// Design V2 (S13-01 §9, D40 decision 4): Rionna is light-only. The theme
// picker is gone, and any stale 'dark'/'system' value persisted by an older
// build is ignored, so OTA users on an old binary can't flip to dark.

// Called once from the root layout before first render.
export function loadSelectedTheme() {
  Uniwind.setTheme('light');
}
