# Flow YAML

Read this reference when polishing, composing, or manually reviewing a flow.

- [File shape and flow type](#file-shape-and-flow-type)
- [Selectors](#selectors)
- [Directives](#directives)
- [Verification conditions](#verification-conditions)
- [Prove a navigation](#prove-a-navigation-identity-then-readiness)
- [Optional divergences](#optional-divergences)
- [Composition and platform limits](#composition-and-platform-limits)
- [Snapshots and standalone runs](#snapshots-and-standalone-runs)
- [YAML safety](#yaml-safety)

## File shape and flow type

```yaml
steps:
  - launch: com.example.app
  - await: { visible: { id: home-screen } }
  - await: { idle: true }
```

An e2e flow has a literal `launch:` as its first non-echo step. It cannot declare `executionPrerequisite`. Put the named start state in a leading echo.

A leading `run:` does not classify the outer flow as e2e, but the runner still follows the chain to the launch it reaches, and on Chromium that launch boots the app before step 1. A flow whose `run:` chain reaches a launch is refused an `executionPrerequisite` too: parse accepts the file, then the run rejects it. The one exception is a run pinned to a Chromium instance you brought to the required state yourself (`--device chromium-cdp-<port>`), where that leading launch only attaches.

A fragment reaches no leading launch, by its own step or through a `run:` chain, and can declare:

```yaml
executionPrerequisite: User is signed in and viewing Settings
steps: []
```

Flows never store a device id. The runner binds the device. `launch:` restarts the process but does not clear app, account, or backend data.

The one exception is a device _scope_ rather than a target: `stop-all-simulator-servers`' `devices` list **is** kept in the YAML, because without it the step means the machine-wide sweep and would tear down devices other agents are mid-session on. Replay rebinds a recorded scope only when you pass `device` explicitly — an auto-detected device would retarget the teardown at a device the flow never named. So the recorded ids are what run when you replay without `device`; on another host they reap nothing and come back in `unmatched`, so re-record the cleanup flow there or pass `device`. A step that recorded no scope is narrowed onto the run's device **only when the run resolved one**. A cleanup flow whose only step is that teardown needs no device, so with none or several booted it resolves none, replays as the machine-wide sweep, and still reports a pass. Record the scope, or pass `device` at replay, whenever the sweep must stay confined.

## Selectors

Use values that meet the [stable-selector definition](../SKILL.md#stable-selectors). Always write explicit maps:

```yaml
{ id: save-button }
{ text: Save }
{ role: button }
{ id: settings-row, text: Notifications }
```

All provided fields must match. `id` is exact and case-insensitive. `text` and `role` are case-insensitive substrings. An unqualified Android id also matches its qualified resource id. `identifier` is accepted as an alias, but `id` is canonical. Never author a bare string. It is loose shorthand that tries id before text.

Use single quotes for anchored, case-sensitive regexes:

```yaml
{ text: { matches: '^Order #\d+$' } }
```

### The runner tree is not the discovery tree

Flow selectors and live discovery use different screen projections:

| Platform | Runner tree                                               | `describe` / `await-ui-element` | Important difference                                                  |
| -------- | --------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| iOS      | native UIView hierarchy                                   | accessibility tree              | Each contains elements the other lacks; roles are derived differently |
| Android  | full accessibility hierarchy                              | trimmed interactables           | Discovery can omit testID-only containers or merge nodes              |
| Chromium | filtered DOM nodes with id, label, value, click, or focus | full DOM walk                   | The runner tree is a strict subset                                    |
| Vega     | toolkit page source                                       | same source                     | Same elements, different shape                                        |

On iOS and Android, an id absent from `describe` can still resolve in a flow. Prefer the stable id and verify it in a scratch fragment. On Chromium, an element absent from `describe` cannot resolve. Add a test id instead.

A live wait can pass against its tree while the converted directive cannot resolve. Replay after conversion. Treat failure there as a polish blocker, not a recording failure.

**On iOS, never copy a `role` from `describe` into a flow selector.** The runner derives iOS roles from the UIView class name and `describe` from accessibility traits, so a React Native `Pressable` (class `RCTView`) is `AXGroup` to the runner and `AXButton` to `describe`. Select on `id`/`text`, or confirm the role against the runner's own tree.

When several nodes match, the directive decides:

- **Actions** (`tap`, `long-press`, `type`, `scroll-to`, `pinch`, `rotate`) take the most specific visible match: exact text/id beats substring, then the smallest frame, then reading order.
- **Conditions** (`await`, `assert`) do not rank. `exists`/`visible` hold if any match qualifies and `hidden` only if none does; `text` reads the first visible match in reading order.

A container that aggregates a child's text therefore splits them: `tap` hits the leaf while `text.in` reads the container, so `equals` fails against correct UI. Use an `id` or a [relational scope](#relational-scopes) when an action and a check must agree, and a stricter selector when ranking can still choose the wrong element.

### Relational scopes

Flow selectors support frame-based `within`, `after`, and `next` in every selector slot. Live `await-ui-element` does not support them.

```yaml
- tap: { text: Delete, within: { id: profile-card } } # inside a container
- assert: { visible: { role: Button, after: { text: Danger zone } } } # any follower
- tap: { role: Switch, next: { text: Wi-Fi } } # nearest matching follower
```

`within` means visual frame containment, not source-tree ancestry. Overflowing children and anchored popovers can fall outside it. `after` and `next` use top-to-bottom, left-to-right reading order. A target cannot satisfy its own `within`, `after`, or `next` anchor. The synthetic root never counts.

`next` finds the nearest matching follower and skips non-matches. It can therefore reach the next row when the intended row lacks a control. Prefer a stable row container with `within`, or assert the row-local control first.

Scopes can combine and nest, with at most six scope keys. Use strict selectors for anchors. Scope through a trusted container when a missing control must fail instead of reaching another row.

## Directives

Directives stop the flow on failure and skip later steps. `flow-execute` documents their shapes. The available directives are `launch`, `tap`, `long-press`, `type`, `scroll-to`, `pinch`, `rotate`, `await`, `assert`, `wait`, `snapshot`, `run`, `when`, `echo`, and `tool`.

Use the launch map for cross-platform flows. A bare launch applies everywhere and becomes an app path on Chromium. The map takes `native:`, `ios:`, `android:`, `vega:`, and `chromium:`. `native:` is one id shared by iOS, Android, and Vega, and a per-platform key overrides it for that platform. `chromium:` accepts a relative or absolute app path. A launch that declares no id for the run's platform is an error, not a cue to switch platforms.

```yaml
- launch: { native: com.acme.app, chromium: ../../app }
- launch: { ios: com.acme.app, android: com.acme.app.android, chromium: ../../app }
```

An Android app that needs a non-launcher activity has no `launch:` form. Record `restart-app` with `activity` and keep the flow as a fragment.

In a `scroll-to` map, put the selector under `target:`. The map supports `up`, `down`, `left`, and `right` directions. The default is `down`; set it explicitly to reach a target above the viewport or along a horizontal carousel. If the target is already visible, the step is a safe no-op. `tap`, `type`, and `long-press` do not auto-scroll. Add `scroll-to` when the target can be off-screen. Use `within` for a nested scroller.

`type` presses Enter in a second `keyboard` call unless `submit: false`. A polished focus tap plus one text-only `keyboard` call usually needs `submit: false`. Store external values as `{{secret:NAME}}`. The runner uses the first source that defines the name: environment `ARGENT_SECRET_NAME`; project `.argent/secrets.env`; project `.env.local`, then `.env`; then `~/.argent/secrets.env`. The two `secrets.env` files accept the bare `NAME`, but the shared dotenv files expose only `ARGENT_SECRET_`-prefixed keys, so a bare `NAME=…` in `.env` or `.env.local` stays unresolved. The runner redacts every resolved value, so do not use a placeholder for content a report must show.

A **selector-less gesture** — a coordinate `tap`/`long-press`, or a `pinch`/`rotate` with no `on:` — resolves no frame, so a tree source it cannot read does not fail it. It settles best effort, dispatches anyway, and the step **passes carrying a warning** that quotes the source's own error. That green says the gesture was sent, not that it landed: one aimed at a moving element can miss it entirely. Restore the tree source, usually by relaunching the app so the instrumentation loads. Accept the warning only where the app serves no tree at all, and put an explicit `wait:` before a gesture that follows a transition. The first such gesture proves the outage and later ones spend that verdict without paying the settle window again. A tree read that comes back, or a relaunch, retires that verdict — which only makes the next gesture pay a fresh window, and it warns again if the source is still down.

## Verification conditions

```yaml
- await: { visible: { id: settings-screen } }
- await: { hidden: { id: loading-spinner }, timeout: 15000 }
- assert: { exists: { id: notifications-toggle } }
- assert: { text: { in: { id: preference-status }, equals: Enabled } }
- assert: { text: { in: { id: result-count }, matches: '^\d+ results$' } }
```

`text.in` locates one element. It compares that element's rendered and descendant text with exactly one comparator:

- `contains`: case-insensitive substring.
- `equals`: case-insensitive full match.
- `matches`: case-sensitive JavaScript regex.

Use `equals` or an anchored regex when boundaries matter. For example, `contains: "Taps: 3"` also matches `Taps: 30`.

Use `await` for an outcome that can take time. Its default is 7500 ms. Add a larger timeout only after the default expires. Use `assert` for settled state. It has a fixed 1000 ms grace and rejects `timeout`.

A negative condition proves only that the current tree has no visible match. It also passes before the element appears, for a typo, or on the wrong screen. First prove the containing screen and the same stable selector as `visible`. Then perform the removing action and check `hidden`. Prefer an additional positive replacement or empty state.

## Prove a navigation: identity, then readiness

Every screen change needs both checks:

```yaml
- await: { visible: { id: profile-screen } } # identity
- await: { idle: true } # readiness
```

The identity selector must exist only on the destination. A dropped tap can leave the source screen idle. A destination element can enter the tree before its animation finishes. Therefore neither check replaces the other.

### `idle` readiness

`idle` waits until the screen has content and stops changing in both the UI tree and pixels.

```yaml
- await: { idle: true, stableFor: 400, timeout: 9000 }
```

`stableFor` (default 250) is how long stillness must hold. `timeout` (default 7500) is the budget for the whole wait, and parse rejects one that cannot contain a settle. A settle spans three reads across two 200ms polls. The floor is the longer of `stableFor` and the 400ms a settle spans, plus the 200ms of budget the closing round needs to start. The hold runs during those polls rather than after them, so only the longer of the two counts: the default 250ms hold needs 600ms and an 800ms hold needs 1000ms. Stillness is measured across intervals, so `stableFor: 0` means the first two agreeing intervals, not the first read. `idle` has no assert form and no `when:` form.

It **never fails a run.** Every outcome short of a clean settle passes with a warning, because readiness is not an acceptance criterion. Read that warning rather than stepping over it:

- **the screen never held still** — it spent the timeout and was still moving on the last interval. A video, shimmer, carousel, or live text stays healthy while moving, and a load that never finished looks identical.
- **a small part of it was still changing** — a spinner, caret, or progress dot moved through the hold. Too small to count as the screen moving, so the settle completed anyway.
- **the screen was still for the last Nms** — the wait ran out mid-hold, so no settle was confirmed. It names the term that was short: a second agreeing interval, or the rest of `stableFor`. Raise this step's `timeout:`, because the wait was too short rather than the screen too busy.
- **the tree stayed empty** — the screen rendered no accessible content: a canvas or video surface, or a screen that never arrived.
- **settled on the UI tree alone** — no screenshot pair could be read, so presentation-layer animation was never waited out.
- **too few reads** — a settle needs three reads across two intervals and this step got fewer, so it ended with no evidence either way.

Only a tree source this step could not read stops the run, as an errored step — one still failing when the wait ends, one that wedges after answering, one that answers with an empty tree it flags as degraded (an unattached Vega toolkit, an AX service asking to be relaunched), or one that never answers (raise `timeout` before suspecting the app). The run is then not ok and every later step is skipped. A single failed read is not that: the hold restarts from the next good read. The same outage stops no [selector-less gesture](#directives), which needs no frame and passes with its own warning instead.

`idle` proves readiness only and never identifies the screen, so it cannot serve as acceptance evidence or replace the identity gate. Gate the next action on a stable element. Add `idle` during polish after each screen change, not after every step.

## Optional divergences

Use `when:` only for optional setup or an interstitial that reconverges:

```yaml
- when: { visible: { text: Got it } }
  steps:
    - tap: { text: Got it }
```

The guard accepts one `exists`, `visible`, `hidden`, or `text` condition, or `{ platform: ios|android|chromium|vega }`. UI guards use the short assert grace and reject `timeout`. There is no `else` or per-step `optional`. Put separate behavioral paths in separate flows. Never place a required acceptance check inside `when:`.

## Composition and platform limits

A `run:` target is a YAML path resolved against the directory of the flow file containing the step, so `../shared/login.yaml` reaches a sibling directory rather than the project root. The `.yaml` suffix is optional: `run: login` and `run: login.yaml` both name `login.yaml` beside the flow.

- iOS and Android can run fragments or e2e flows inline. A nested e2e launch restarts its app.
- Chromium boots one instance per launch **step**, not one per run. The leading launch — the flow's own, or the one its leading `run:` chain reaches — boots before step 1, unless you pinned the run with an explicit `device`, where it only attaches. Every later launch boots a fresh instance, moves the run onto it, and tears down the instance the run already owned for that app path. Nesting a Chromium e2e flow with its own launch is therefore the supported way to give a sub-scenario its own restart. Chromium rejects `pinch` and `rotate`. Use the app's own zoom or rotate controls.
- Vega uses `tool: tv-remote` and raw `tool: keyboard`. The touch directives (`tap`, `long-press`, `type`, `scroll-to`, `pinch`, `rotate`) are unsupported. Gate focus and navigation results with `await`.

## Snapshots and standalone runs

`argent flow run <name> [--device <id>] [--platform ios|android|chromium|vega] [--update-baselines] [--output <dir>] [--json]` runs without an LLM and exits non-zero on failure.

A screenshot is human evidence. A `snapshot:` is executable visual verification. A missing baseline or excessive mismatch fails. A `cropOn` size change also fails. Use snapshots for color, layout, size, spacing, typography, clipping, overflow, images, icons, or stable component appearance. Use full screen for global changes and `cropOn` for one component.

Do not use a snapshot as the only proof of navigation, persistence, data, accessibility state, logs, or network behavior. Avoid unstable timestamps, live data, ads, animation, and device drift. First establish deterministic state, identity, and readiness.

Baselines live under `.argent/flows/__baselines__/<flow>/` and are keyed by platform and full-capture geometry; `cropOn` also contributes its selector. Seed from a known-good state with `--update-baselines`. Inspect every baseline and require user review. Do not commit it yourself. Baseline creation or update is not a test pass. Never update a baseline only to make a diff pass. The default `maxMismatch` is 0.5 percent.

Pin `--platform` and `--device` for iOS, Android, or Vega. For Chromium the device class is the window's own pixel size, which the app sets and no launch argument changes: pass `--platform chromium` and omit `--device` so the runner boots the declared app path instead of attaching to a running window of another size. A window sized from host or session state produces a key CI cannot reproduce, and the step fails for a missing baseline. The runner pins mobile status bars during visual runs. `--output <dir>` writes failed baseline, current, and diff images under `<dir>/<flow>/` for CI artifact upload.

## YAML safety

Quote strings containing `#`, `:`, or quotes. Quote numbers and `true` or `false` in text slots. Use single quotes for regexes with backslashes. Parsing rejects invalid directives, selectors, regexes, `else`, unsupported options, and e2e flows that also declare `executionPrerequisite`.
