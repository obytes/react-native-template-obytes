---
name: argent-test-ui-flow
description: Autonomously test an app UI (iOS or Android) by running interact-screenshot-verify loops using argent MCP tools. Use when testing UI flows, verifying login works, testing navigation, running end-to-end UI test scenarios, manual QA steps, visible UI changes, or visual behavior.
---

## Platform-agnostic

The interaction tool names are identical on iOS and Android — `gesture-tap`, `gesture-swipe`, `describe`, `screenshot`, `launch-app`, etc. — and the tool-server auto-dispatches based on the `udid` you pass (UUID-shape → iOS, adb serial → Android).

**Before testing, resolve which device to test on.** Call `list-devices` and follow `<device_selection_rule>`: prefer a running device on any platform;

Once a platform is chosen, the per-platform setup skill takes over:

| Platform | Setup skill                     | Find devices with                                           |
| -------- | ------------------------------- | ----------------------------------------------------------- |
| iOS      | `argent-ios-simulator-setup`    | `list-devices` → `boot-device` with `udid` if none booted   |
| Android  | `argent-android-emulator-setup` | `list-devices` → `boot-device` with `avdName` if none ready |

## 1. Workflow

All interactions go through argent MCP tools. Ensure the simulator/emulator is ready before starting.

For implementation tasks that modify visible UI, this workflow can also serve as a visual acceptance path.

1. **Baseline screenshot**: Call `screenshot` to see the current UI state. For visual regression comparison or UI change verification, capture the baseline at `scale: 1.0` with `includeImageInContext: false` and keep the returned `path` before editing whenever feasible.
2. **Find target**: Before tapping, use a discovery tool to get element coordinates:
   - **React Native apps**: use `debugger-component-tree` — it returns component names with (tap: x,y) coordinates. This is the preferred tool for RN apps on either platform. To use it, resolve the `argent-react-native-app-workflow` skill for setup; on Android you must also run `adb -s <serial> reverse tcp:8081 tcp:8081` so Metro is reachable from the device.
   - **Standard app screens and in-app modals**: use `describe`. On iOS this returns the AX tree (falls back to native-devtools when AX is empty); on Android it returns the uiautomator tree in the same DescribeNode shape.
   - **Permission prompts / system modal overlays**: try `describe` first. Fall back to `screenshot` only if the overlay is not exposed reliably. When the app raises its own permission dialog, answer it here — that's the real flow under test. To take a prompt _out_ of the flow (pre-grant/deny before launch, re-enable a permission the user already denied, or reset it so the dialog reappears), use the `argent-settings-permissions` skill during setup instead of interacting with the dialog.
   - **Fallback**: use `screenshot` to estimate where the desired component is, then verify immediately after the action.
3. **Interact**: Perform the action (`gesture-tap`, `gesture-swipe`, `keyboard`, `button`, ...) — you receive a screenshot automatically.
4. **Verify**: Check the returned screenshot for expected results. If it shows a loading/transitional state, prefer blocking until it settles with `await-ui-element` (expected element `visible`, or a spinner `hidden`) over a guessed delay — but only with a selector you can trust (`text`/`identifier`/`role`) that the screen is known to have or that you saw in a prior `describe`; a guessed one just times out. Otherwise use a short fixed wait. Pick evidence by what's being asserted:
   - **Visual** (layout, spacing, color, typography, image/icon rendering, clipping, overflow, text rendering): prefer `screenshot-diff` against the baseline captured in step 1 — it surfaces pixel-visible changes the auto-screenshot might miss. Fall back to visual inspection of the auto-screenshot only when a stable baseline isn't available.
   - **Structural** (navigation state, element existence, accessibility labels/values, selection, hierarchy, route): verify with `describe`, `debugger-component-tree`, or `native-describe-screen`.
   - **Runtime / log / network** (console errors, API calls, persistence, timing): verify with `view-network-logs`, `debugger-log-registry`, `debugger-evaluate`, or targeted tests. Note `debugger-log-registry` returns `{ status: "not_connected", reason, guidance }` with no log file when the debugger is unreachable — that is not evidence about the app; follow its `guidance` to reconnect, then re-verify.
   - **Mixed**: collect evidence for each relevant class.
   - Report the combined verdict: expected behavior, observed behavior, evidence used, and any blocker for requested visual diffing.
5. **Repeat** for each step in the flow.

## 2. Template

```
Goal: Test [feature name]

Steps:
1. Classify expected result: visual / structural / runtime-log-network / mixed → choose evidence
2. [Navigate / tap / type to reach stable comparable starting point] → verify auto-screenshot
3. screenshot { scale: 1.0, includeImageInContext: false } → save baseline path when visual or mixed evidence needs diffing
4. [Perform the action to test] → verify auto-screenshot
5. Use screenshot-diff when requested or when comparable images add useful visual evidence
6. Report: pass / fail with combined visual, structural, runtime/log/network evidence as applicable
```

## 3. Examples

### Login flow

```
1. screenshot → see login screen
2. gesture-tap { x: 0.5, y: 0.4 }  → tap email field
3. keyboard { text: "user@example.com" }
4. gesture-tap { x: 0.5, y: 0.55 } → tap password field
5. keyboard { text: "{{secret:APP_PASSWORD}}" }
6. gesture-tap { x: 0.5, y: 0.7 }  → tap Login button
7. screenshot → verify home screen appeared
```

> **Credentials:** never type plaintext credentials — use a `{{secret:<NAME>}}` placeholder in `keyboard`, resolved server-side so the value never enters agent context. It comes from the `ARGENT_SECRET_<NAME>` environment variable or an argent secrets file (`.argent/secrets.env` in the project, `~/.argent/secrets.env`, or an `ARGENT_SECRET_`-prefixed key in the project's `.env` / `.env.local`). If the name is not defined, the failure lists the available names and every path it checked — ask the user to add it to one of those files (which applies immediately) instead of pasting the secret into the conversation. Never invent credentials or echo secret values into reports or saved files.

### Scroll and navigation

```
1. screenshot → see list at top
2. gesture-swipe { fromY: 0.7, toY: 0.3 } → scroll down
3. gesture-tap item at visible position → verify auto-screenshot
4. screenshot → verify detail view opened
5. button { button: "back" }
6. screenshot → verify returned to list
```

### Visual behavior check

```
1. Classify expected result as visual or mixed.
2. Navigate to the stable starting state.
3. screenshot { scale: 1.0, includeImageInContext: false } → save baseline path.
4. describe / debugger-component-tree → find the control and use its returned tap coordinates.
5. gesture-tap → perform the visual behavior under test.
6. screenshot-diff { baselinePath, captureCurrent: true, udid, outputDir } → inspect visible change or stability.
7. describe / debugger-component-tree → verify selected state, label, route, or attributes if relevant.
8. Report combined verdict from expected behavior, visual inspection, diff summary, and structural evidence.
```

### Wait for a loading spinner

```
1. gesture-tap { x: 0.5, y: 0.7 } → trigger an action that fetches data
2. screenshot → loading spinner is showing
3. await-ui-element { condition: hidden, selector: { text: "Loading" } } → block until the fetch finishes and the spinner disappears
4. describe / screenshot → verify the fetched content rendered
```

---

## 4. Recovery Pattern

- If a screen is mid-transition or loading: block until it settles with `await-ui-element` (wait for the target element to be `visible`, or the spinner/placeholder to be `hidden`) instead of a blind fixed delay, then re-check. Fall back to a fixed wait + `screenshot` only when no element reliably marks the transition.
- If tap misses target: re-run discovery tool (`describe` / `debugger-component-tree`), retry once with new coordinates.
- If a permission dialog or modal is visible: re-run `describe` first. Stay in screenshot-driven navigation only when the overlay is not exposed reliably, then switch back to `describe` / `debugger-component-tree` as soon as it is dismissed.
- If tap fails twice at same coordinates: stop, re-discover, report if element not found.
- If a **saved flow** fails during `flow-execute` replay (as opposed to live test steps above): follow `argent-create-flow`'s [Diagnose a replay failure](../argent-create-flow/references/reliability-and-recovery.md#diagnose-a-replay-failure) — classify the failure, inspect the actual screen, repair the smallest justified unit, then replay the full flow.

## Tips

- **Wait on the UI, don't poll.** When a step needs the screen to change first, gate it with `await-ui-element` (block until an element is `visible`/`hidden` or contains `text`) rather than repeated `screenshot` calls with fixed sleeps. See the `await-ui-element` section of `argent-device-interact`.
- **Use `gesture-custom` for long-press** context menus (800ms hold).
- **Report clearly**: state what you expected, what you saw, and the verdict.
- **Permission modals**: try `describe` first. Use `screenshot` only as fallback, tap one visible button at a time, and verify with the returned screenshot before continuing.
- **Record for replay**: If a tested flow is likely to be repeated, use the `argent-create-flow` skill to record it as a `.yaml` script. This lets you replay the entire sequence later with a single `flow-execute` call instead of re-running each step manually.

## Related Skills

| Skill                              | When to use                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `argent-device-interact`           | Tool usage for tapping, swiping, typing (iOS + Android)  |
| `argent-screenshot-diff`           | Visual regression and before/after screenshot comparison |
| `argent-ios-simulator-setup`       | Booting and connecting an iOS simulator                  |
| `argent-android-emulator-setup`    | Booting and connecting an Android emulator               |
| `argent-react-native-app-workflow` | Starting the app, Metro, build issues                    |
| `argent-metro-debugger`            | Breakpoints, console logs, JS evaluation                 |
| `argent-create-flow`               | Record a test sequence as a replayable flow              |
