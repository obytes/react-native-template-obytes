---
name: argent-device-interact
description: Interact with an iOS simulator, Android emulator, or Chromium (CDP) app using argent MCP tools. Use when tapping UI elements, performing gestures, scrolling/swiping, typing text, pressing hardware buttons, launching apps, opening URLs, taking screenshots, waiting for an element to appear or disappear, or checking visible app state after interactions.
---

## Unified tool surface

All interaction tools below accept a `udid` parameter and auto-dispatch iOS vs Android based on its shape (UUID → iOS simulator, `chromium-cdp-<port>` → Chromium (CDP) app, anything else → Android adb serial). You use the same tool names on every platform.

**Chromium (CDP) app** = any Chromium runtime exposing a Chrome DevTools Protocol endpoint: an Electron app (boot it with `boot-device` + `electronAppPath`), or any Chromium-family browser (Chrome/Brave/Edge) launched with `--remote-debugging-port`. The latter is auto-discovered by `list-devices` on port `9222` plus anything in `ARGENT_CHROMIUM_PORTS`. The same describe/tap/swipe/keyboard/screenshot surface drives all of them.

**Multi-tab / windows (Chromium only):** a Chromium device may have several tabs / BrowserWindows. Use `chromium-tabs` to `list` them (stable ids `t1`, `t2`, …, optional labels), open a `new` one, `select` which is active, or `close` one. Every other tool (`describe`, `gesture-tap`, `screenshot`, `debugger-evaluate`, `open-url`, …) acts on the **active** tab, so `chromium-tabs action=select` before driving a different tab. Note: a cross-process navigation (some redirects) can swap a tab's underlying CDP target — re-run `chromium-tabs action=list` to pick it up under a fresh id.

**Cookies & storage (Chromium only):** `chromium-cookies` reads/writes cookies via the Network domain (so HttpOnly cookies are visible): `action=get` (optionally scoped by `url`), `set` (`name`, `value`, + `url`/`domain`, optional `secure`/`httpOnly`/`sameSite`/`expires`), `delete` (`name`), `clear` (all). `chromium-storage` reads/writes Web Storage for the active page: `store=local|session`, `action=get` (one `key` or all entries), `set`, `remove`, `clear`. Both are per-origin / active-tab. Handy for seeding auth before a flow or asserting app state after one.

> **TV targets (Apple TV / Android TV) are not covered by this skill.** A TV target is **focus-driven, not touch-driven** — the `gesture-*` tools are the wrong tools for it. This applies to both Apple TV simulators (UUID-shaped, identical to iOS) and Android TV / leanback devices (serial-shaped, identical to a phone emulator). If `list-devices` tags your target `runtimeKind: "tv"`, stop and use the `argent-tv-interact` skill: `describe` to read focus, `tv-remote` for remote / D-pad presses, and `keyboard` to type.

For platform-specific caveats (Metro `adb reverse`, locked-screen describe errors, etc.), see § 9 Platform-specific notes at the bottom.

## 1. Before You Start

If you delegate simulator tasks to sub-agents, make sure they have MCP permissions.

Use `list-devices` to get a target id. Results are tagged with `platform` (`ios`, `android`, or `chromium`); booted/ready devices come first. Pick the first entry that matches the platform you need — if none are ready, call `boot-device` with `udid` (iOS), `avdName` (Android), or `electronAppPath` (boots an Electron app as a `chromium` device). A Chromium browser already running with a CDP port shows up directly — no `boot-device` needed. See `argent-ios-simulator-setup` / `argent-android-emulator-setup` for full setup flow.

**Load tool schemas before first use.** Gesture tools (`gesture-tap`, `gesture-swipe`, `gesture-pinch`, `gesture-rotate`, `gesture-custom`) may be deferred — their parameter schemas are not loaded until fetched. Always use ToolSearch to load the schemas of all gesture tools you plan to use **before** calling any of them. If you skip this step, parameters may be coerced to strings instead of numbers, causing validation errors.

## 2. Best Practices

1. **Always refer to tapping_rule** from your argent.md rule before tapping.
2. Before performing interactions, consider whether they can be **dispatched sequentially** - more on that in `run-sequence`.
3. **Use `gesture-swipe` for lists/scrolling**, not `gesture-custom`, unless you need non-linear movement. On Chromium use `gesture-scroll` instead — `gesture-swipe` is touch-only. Consider whether you need multiple swipes, if yes - use `run-sequence`.
4. **Tap a text field before typing**, then use `keyboard` to enter text.
5. **Coordinates are normalized** — always 0.0–1.0, not pixels.
6. **For app navigation, prefer `describe` first.** It works on any screen without app restart. Do not navigate from screenshots on regular in-app screens unless `describe` failed to expose a reliable target. Use `native-describe-screen` only when you need app-scoped UIKit properties.

## 3. Opening Apps

**Never navigate to an app by tapping home-screen icons.** Use `launch-app` or `open-url` — they are instant and reliable.

### launch-app — by bundle ID

```json
{ "udid": "<UDID>", "bundleId": "com.apple.MobileSMS" }
```

Common IDs: `com.apple.MobileSMS` (Messages), `com.apple.mobilesafari` (Safari), `com.apple.Preferences` (Settings), `com.apple.Maps`, `com.apple.Photos`, `com.apple.mobilemail`, `com.apple.mobilenotes`, `com.apple.MobileAddressBook` (Contacts)

### open-url — by URL scheme

```json
{ "udid": "<UDID>", "url": "messages://" }
```

Common schemes: `messages://`, `settings://`, `maps://?q=<query>`, `tel://<number>`, `mailto:<address>`, `https://...` (Safari)

## 4. Choosing the Right Tool

| Action            | Tool                | Notes                                                            |
| ----------------- | ------------------- | ---------------------------------------------------------------- |
| Multiple actions  | `run-sequence`      | Batch steps in one call (no intermediate screenshots)            |
| Open an app       | `launch-app`        | **Always — never tap home-screen icons**                         |
| Restart an app    | `restart-app`       | Terminate and relaunch by bundle ID                              |
| Open URL/scheme   | `open-url`          | Web pages, deep links, URL schemes                               |
| Single tap        | `gesture-tap`       | Buttons, links, checkboxes                                       |
| Scroll/swipe      | `gesture-swipe`     | Straight-line scroll or swipe                                    |
| Scroll (Chromium) | `gesture-scroll`    | Wheel-based; deltas are window fractions, positive deltaY = down |
| Drag (Chromium)   | `gesture-drag`      | Sliders, drag-and-drop, text selection                           |
| Long press        | `gesture-custom`    | Context menus, drag start                                        |
| Drag & drop       | `gesture-custom`    | Complex drag interactions                                        |
| Pinch/zoom        | `gesture-pinch`     | Two-finger pinch with auto-interpolation                         |
| Rotation          | `gesture-rotate`    | Two-finger rotation with auto-interpolation                      |
| Custom gesture    | `gesture-custom`    | Arbitrary touch sequences, optional interpolation                |
| Hardware key      | `button`            | Home, back, power, volume, appSwitch, actionButton               |
| Type text         | `keyboard`          | Every platform. Text or one named key per call, never both       |
| Rotate device     | `rotate`            | Orientation changes                                              |
| Shake device      | `shake`             | Shake handlers (sim/emu only), Undo-typing prompt, RN dev menu   |
| Wait for UI       | `await-ui-element`  | Block until an element is visible/hidden/exists/contains text    |
| Wait for idle     | `await-screen-idle` | Block until a non-empty screen tree stops changing               |

## 5. Finding Tap Targets

IMPORTANT. When moved to a different screen after an action or do not know the coordinates of component, **always** perform proper discovery first.

| App type                          | Discovery tool            | What it returns                                                                                                                                                                                                                                     |
| --------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target app discovery              | `describe`                | Accessibility element tree for the current device screen (iOS AX-service, Android uiautomator, or Chromium DOM walker) with normalized frame coordinates. Works on any app, system dialogs, and Home screen — no app restart or `bundleId` required |
| React Native                      | `debugger-component-tree` | React component tree with names, text, testID, and (tap: x,y)                                                                                                                                                                                       |
| App-scoped native                 | `native-describe-screen`  | Low-level app-scoped accessibility elements with normalized and raw coordinates; requires `bundleId`                                                                                                                                                |
| Permission / system modal overlay | `describe`                | `describe` detects system dialogs automatically and returns dialog buttons with tap coordinates. Fall back to `screenshot` only if `describe` does not expose the controls                                                                          |
| Final visual fallback             | `screenshot`              | Use only when discovery tools cannot inspect the current UI reliably. Do not derive routine in-app navigation targets from screenshots                                                                                                              |

Point follow-up native diagnostics after you already have a candidate point:

- `native-user-interactable-view-at-point`: deepest native view that would receive touch at a known raw iOS point; requires `bundleId`
- `native-view-at-point`: deepest visible native view at a known raw iOS point; requires `bundleId`

### If `describe` Fails

Read the exact error and choose the action that matches it:

- Error mentions `ax-service` not available or daemon startup failure:
  the ax-service daemon could not start. Check that the simulator is booted. Use `screenshot` as a temporary fallback, or use `native-describe-screen` with an explicit `bundleId` if the app has native devtools injected.
- `describe` returns an empty element list:
  the screen may be blank, loading, or showing content without accessibility labels. Use `screenshot` to see what is visible, then retry after the content has loaded.
- `describe` succeeds but is not detailed enough for a React Native app:
  use `debugger-component-tree` next.
- You need app-scoped inspection with full UIKit properties (`accessibilityIdentifier`, `viewClassName`):
  use `native-describe-screen` with an explicit `bundleId`. This requires native devtools (dylib) injection — call `restart-app` first if needed.
- You already have a candidate point and want to confirm what would actually receive touch:
  use `native-user-interactable-view-at-point`. Use `native-view-at-point` when you want the visually deepest view instead of the hit-test target.

## 6. Tool Usage

### gesture-tap — Single tap at a point

```json
{ "udid": "<UDID>", "x": 0.5, "y": 0.5 }
```

Coordinates: `0.0` = left/top, `1.0` = right/bottom.

Before tapping near the bottom of the screen in React Native apps, check that "Open Debugger to View Warnings" banners are not visible — tapping them breaks the debugger connection. Close them with the X icon if present.

### gesture-swipe — Straight-line gesture

```json
{ "udid": "<UDID>", "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 }
```

Swipe **up** (`fromY > toY`) = scroll content **down**. Default duration: 300ms. Optional: `"durationMs": 500` for slower swipe.

### gesture-pinch — Two-finger pinch

```json
{ "udid": "<UDID>", "centerX": 0.5, "centerY": 0.5, "startDistance": 0.2, "endDistance": 0.6 }
```

All values are normalized 0.0–1.0 (fractions of screen, not pixels) — same as all other gesture tools. `startDistance: 0.2` means fingers start 20% of the screen apart; `endDistance: 0.6` means they end 60% apart. `startDistance < endDistance` = pinch out (zoom in). `startDistance > endDistance` = pinch in (zoom out). Defaults: `angle: 0` (horizontal), `durationMs: 300`. Optional: `"angle": 90` for vertical axis, `"durationMs": 500` for slower pinch, `"endCenterX"`/`"endCenterY"` to let the centroid drift to a new center over the gesture (omitted = fixed center).

### gesture-rotate — Two-finger rotation

```json
{
  "udid": "<UDID>",
  "centerX": 0.5,
  "centerY": 0.5,
  "radius": 0.15,
  "startAngle": 0,
  "endAngle": 90
}
```

All positions and radii are normalized 0.0–1.0 (fractions of screen, not pixels). `radius: 0.15` means each finger is 15% of the screen away from center. `endAngle > startAngle` = clockwise. Default duration: 300ms. Optional: `"durationMs": 500` for slower rotation, and `"radiusX"`/`"radiusY"` (fractions of screen width/height; give both — they override `radius`) with `radiusX·width = radiusY·height` for a physically circular orbit — a single `radius` traces a physical ellipse on a non-square screen, coupling a slight pinch into the turn.

### gesture-custom — Custom touch sequence

For long-press, drag-and-drop, and other complex sequences, see `references/gesture-examples.md`. Set `"interpolate": 10` to auto-generate smooth intermediate Move events between keyframes.

### button — Hardware button press

```json
{ "udid": "<UDID>", "button": "home" }
```

Values: `home`, `back`, `power`, `volumeUp`, `volumeDown`, `appSwitch`, `actionButton`

### keyboard — Type text or press special keys

```json
{ "udid": "<UDID>", "text": "search query" }
```

One call does one action. `text` and `key` are mutually exclusive, and a call that carries both is rejected with nothing typed. To type and then submit, send two `keyboard` steps in one `run-sequence` (§ 8) — `{ "text": "search query" }`, then `{ "key": "enter" }`. Two separate calls do the same work, but cost an extra round-trip.

Special keys: `enter`, `escape`, `backspace`, `tab`, `space`, `arrow-up`, `arrow-down`, `arrow-left`, `arrow-right`, `f1`–`f12`. Optional: `"delayMs": 100` between keystrokes (default 50ms) — applies to the iOS simulator and Chromium; it is ignored on Android phones/tablets (typed via `adb input text`, no per-key cadence), on Vega, and on TV targets.

**Typing secrets.** To enter a credential without its plaintext ever entering your context, transcript, or logs, use a secret placeholder in `text` (works in `keyboard`, `paste`, `run-sequence` keyboard steps, and flow `type` steps):

```json
{ "udid": "<UDID>", "text": "{{secret:APP_PASSWORD}}" }
```

The placeholder is resolved on the machine running the tool-server, from the first of these that defines the name:

| #   | Source                                        | Which keys it exposes                                                |
| --- | --------------------------------------------- | -------------------------------------------------------------------- |
| 1   | `ARGENT_SECRET_<NAME>` environment variable   | prefixed vars only — the CI-native path                              |
| 2   | `<project>/.argent/secrets.env`               | every key (`APP_PASSWORD=…`) — gitignore this file                   |
| 3   | `<project>/.env.local`, then `<project>/.env` | only `ARGENT_SECRET_`-prefixed keys, so app config stays unreachable |
| 4   | `~/.argent/secrets.env`                       | every key — per-user, works in any project                           |

Rules:

- The result echoes the placeholder, never the value. An unknown name fails with the list of available secret _names_ and every source it looked in, with paths — read that list before asking the user anything.
- The auto-screenshot after the call is skipped so the typed value cannot re-enter your context as pixels. Do **not** `describe` or `screenshot` a non-secure field you just filled with a secret — submit or navigate away first, then verify the resulting screen. To submit, put the text step and the Enter step in **one `run-sequence`**. The skip covers a whole batch that contains the placeholder, but a second bare `keyboard` call gets its own screenshot of the filled field.
- Nothing outside those sources is reachable; never ask the user to paste a secret value into the conversation. Ask them to put it in a secrets file instead — a file edit applies to the next call, while an exported env var only reaches a tool-server started afterwards.
- The project sources are found by walking up from the tool-server's working directory. If a project file is not being picked up, the failure's source list shows the paths actually consulted; `~/.argent/secrets.env` needs no project and always applies.

### rotate — Change orientation

```json
{ "udid": "<UDID>", "orientation": "LandscapeLeft" }
```

Values: `Portrait`, `LandscapeLeft`, `LandscapeRight`, `PortraitUpsideDown`

### await-ui-element — Block until a UI element reaches a state

Instead of polling `screenshot`/`describe` in a loop, use `await-ui-element` to block server-side until an element reaches an expected state (or `timeoutMs`, default 5000ms, elapses). It polls the same accessibility/DOM tree as `describe`. (For a plain pause, use your own harness sleep — this tool deliberately has no bare-timer mode.)

```json
{ "udid": "<UDID>", "condition": "visible", "selector": { "text": "Continue" } }
```

- `condition`: `exists`, `visible`, `hidden`, or `text`.
- `selector`: `{ text?, identifier?, role? }` — every provided field must match. `text` matches the element's label or value and `role` its element role (e.g. `AXButton`, `button`, `TextView`, `StaticText`), both as case-insensitive substrings; `identifier` matches its accessibility id / resource-id / testID **exactly** (case-insensitive), also accepting the unqualified Android resource-id name (`submit` matches `com.example.app:id/submit`). The synthetic `ROOT` container `describe` prints is never matched, so a `role` like `AXGroup`/`html` won't trivially "match the screen".
- Prefer a **specific** selector. A loose substring can match several elements, and the tool may then key off one you didn't mean: `text` reads the first **visible** match in **reading order** (top-to-bottom, left-to-right — the same order `describe` lists them, so it's the one you saw first; when no match is visible, the first match overall), while `visible`/`exists` are satisfied by **any** match. Disambiguate with a longer or more exact string, an `identifier`, or a `role` (e.g. pin to a text role like `StaticText` to skip a same-named button). On a `text` timeout the `note` quotes the matched element's text, so you can see which one it landed on.
- `text` condition also needs `expectedText` (substring the matched element must contain).
- `hidden` passes when the selector matches nothing. If `note` says it never matched, treat the check as failed and fix the selector. On iOS, a degraded empty tree does not report `hidden` success; the note gives the recovery hint.
- Optional `timeoutMs` (default 5000) and `pollIntervalMs` (default 400).

Returns `{ success, elapsed }`; on a timeout `success` is `false` and a `note` explains what was seen.

### await-screen-idle — Block until the screen stops changing

Use after launch/navigation and before a raw tap, when an early-painted element may still be moving:

```json
{ "udid": "<UDID>", "timeoutMs": 3000, "minStableMs": 250 }
```

On local iOS, Android, and Chromium, the tool waits for a non-empty `describe` tree to stop changing. Continue only when `settled: true`. Pair it with a destination-specific `await-ui-element`; stillness does not identify a screen.

Use it only for live diagnosis. Do not record it or put it in `run-sequence`. Flows use `await: { idle: true }`, which also compares pixels. This live tool can return during a presentation-layer animation.

---

## 7. Screenshots

Use the explicit `screenshot` tool only when:

- You need the initial screen state before any action.
- You are about to edit visible UI and need a baseline capture before making changes.
- The auto-attached screenshot shows a transitional or loading frame.
- You require extra context.
- You want to check state after a delay (e.g. waiting for a network response).
- A permission dialog, system alert, or native modal overlay is visible and `describe` did not expose reliable targets.

When using `screenshot` for permission or native modal navigation:

- Do not switch to screenshot-driven navigation just because a modal is visible. On regular app screens and in-app modals, keep using `describe`.
- Prefer obvious, centered alert buttons such as `Allow`, `OK`, `Don't Allow`, `Not Now`, or `Continue`.
- Tap one control at a time and inspect the returned auto-screenshot before doing anything else.
- After the modal is dismissed, return to normal discovery with `describe`, `native-describe-screen`, or `debugger-component-tree`.

> **Prefer the dialog over the Settings tool.** When the app triggers its own permission prompt, answering it here is the real user path — do that. Reach for the `settings-permissions` tool only when you can't get to the change through the app: pre-authorize/deny a permission _before_ the app asks, re-enable one the user already denied (iOS won't re-prompt), or reset it so the prompt reappears. See the `argent-settings-permissions` skill.

Optional rotation parameter: `{ "udid": "<UDID>", "rotation": "LandscapeLeft" }` — rotates the capture without changing simulator orientation.

Screenshots are downscaled by default (30% of original resolution) to reduce context size. Use the normal downscaled screenshot for UI context and state checks. `scale` accepts values from 0.01 to 1.0, but do not use `scale: 1.0` as a general readability or tapping aid.

Use full-resolution screenshots only when saving baseline/current PNG files for comparison. In that case, suppress the image block so the full-size PNG is not loaded into agent context:

```json
{ "udid": "<UDID>", "scale": 1.0, "includeImageInContext": false }
```

For visual regression checks, before/after screenshot comparisons, and detailed `screenshot-diff` parameter guidance, use the `argent-screenshot-diff` skill. Keep this skill focused on device interaction mechanics and screenshot capture.

### Troubleshooting

| Problem                 | Solution                                                      |
| ----------------------- | ------------------------------------------------------------- |
| Screenshot times out    | Restart the simulator-server via `stop-simulator-server` tool |
| No booted iOS simulator | Call `boot-device` with the iOS `udid`                        |
| No ready Android device | Call `boot-device` with `avdName`                             |

---

## 8. Action Sequencing with `run-sequence`

Use `run-sequence` to batch multiple interaction steps into **a single tool call**. Only one screenshot is returned — after all steps complete. Use cases:
scrolling multiple times, typing and submitting automatically, known sequence of multiple taps, rotating device back and forth.

Do **not** use `run-sequence` when any step depends on observing the result of a previous step

### Use cases

Use the sequencing when:

- Knowing that some action needs multiple steps without necessarily immediate insight of screenshot
- "scroll to bottom", "scroll to top", "scroll to do X" -> sequence scroll 3-5 times
- form interactions, "clear and retype field" -> you may use triple-tap to select all, type new value
- "submit form" → fill all fields in sequence, tap submit
- "go back to X" → defined tap sequence for the navigation

### Allowed tools inside `run-sequence`

`gesture-tap`, `gesture-swipe`, `gesture-scroll`, `gesture-drag`, `gesture-custom`, `gesture-pinch`, `gesture-rotate`, `button`, `keyboard`, `rotate`, `await-ui-element`

The `udid` is shared — do **not** include it in each step's `args`. Optional `delayMs` per step (default 100ms).

Add an `await-ui-element` step to gate a later tap on a screen transition (e.g. tap → wait for the next screen's button → tap it). If its condition is **not** met before the timeout, the sequence stops at that step and the following steps do **not** run — so a mistimed tap can't fire against a screen that never settled.

### Examples

Scroll down three times:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "gesture-swipe", "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 } },
    { "tool": "gesture-swipe", "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 } },
    { "tool": "gesture-swipe", "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 } }
  ]
}
```

Type into a focused field and submit. This is the only way to mix text and a key, because one `keyboard` call cannot carry both:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "keyboard", "args": { "text": "hello world" } },
    { "tool": "keyboard", "args": { "key": "enter" } }
  ]
}
```

Tap a known button, then scroll down:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "gesture-tap", "args": { "x": 0.5, "y": 0.15 } },
    {
      "tool": "gesture-swipe",
      "args": { "fromX": 0.5, "fromY": 0.7, "toX": 0.5, "toY": 0.3 },
      "delayMs": 300
    }
  ]
}
```

Tap, wait for the next screen, then act on it — the `await-ui-element` step **gates** the tap after it:

```json
{
  "udid": "<UDID>",
  "steps": [
    { "tool": "gesture-tap", "args": { "x": 0.5, "y": 0.9 } },
    {
      "tool": "await-ui-element",
      "args": { "condition": "visible", "selector": { "text": "Continue" } }
    },
    { "tool": "gesture-tap", "args": { "x": 0.5, "y": 0.5 } }
  ]
}
```

Prefer this over a fixed `delayMs` when a step depends on a screen transition: it adapts to real load time, and if the condition is not met before the timeout the sequence **stops there** so the next tap can't fire against a screen that never settled.

Stops on the first error (or unmet `await-ui-element` condition) and returns partial results.

---

## 9. Platform-specific notes

### Android

- **Metro reachability**: run `adb reverse tcp:8081 tcp:8081` on the device before the RN app starts, or Metro won't be reachable from the device. See `argent-metro-debugger` for the full workflow. Re-run if the device restarts.
- **First-launch permission prompts**: `reinstall-app` on Android always installs with `-g` so runtime permissions are pre-granted on first launch — no flag to pass.
- **Locked screen / secure surfaces**: `describe` throws a clear error if it can't capture (keyguard, DRM, Play Integrity). Unlock the device or fall back to `screenshot`.
- **APK vs .app in `reinstall-app`**: pass `.apk` absolute path on Android; `.app` directory on iOS.

### iOS

_(no iOS-only gotchas collected here yet — add them as they come up)_
