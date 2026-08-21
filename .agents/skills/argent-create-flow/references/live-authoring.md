# Live authoring

Read this file before creating or changing a flow. Exercise the saved path through the recorder. Perform syntax cleanup only after finishing.

- [Recorder contract](#recorder-contract)
- [Start in the correct order](#start-in-the-correct-order)
- [Record the first walkthrough](#record-the-first-walkthrough)
- [Finish and polish](#finish-and-polish)
- [Worked example](#worked-example)
- [Blocking audit](#blocking-audit)
- [Replay](#replay)

## Recorder contract

`flow-add-step.command` is an MCP tool name. `args` is a JSON string, not an object. Omit `args` for a no-argument tool.

```text
command: "gesture-tap"
args: "{\"udid\":\"DEVICE\",\"x\":0.5,\"y\":0.35}"
```

A recorded `flow-execute` has two names. The top-level `name` identifies the recording. `args.name` identifies the sibling flow captured as `run:`.

Obey these lifecycle rules:

1. Pass the same `name` and absolute `project_root` to every recording tool.
2. Choose a name unique to the task. Another caller can take over the same pair without an ownership check. The pair is keyed by the file the filesystem resolves to, not the spelling you passed, so a differently-cased name or a symlinked `.argent/flows` collides too. That collision is reported: the second start says `restarted`, and the first recording's next call fails naming both spellings.
3. Give concurrent recordings separate devices. Their files are isolated, but their live device actions are not.
4. Treat `flow-start-recording` as destructive. It always truncates the named YAML, including a finished or committed flow. `restarted` reports only a displaced live take.
5. If a call says the recording is inactive, do not restart under that name. The completed take can still be on disk. Copy it aside or record under a fresh name.
6. Inspect `toolResult`, `message`, and `recorded` after each call. A call that errors records nothing, but a call that returns normally while reporting an unmet condition **does** append the step, and `message` says the step was added either way. `await-ui-element` is the case that turns up in practice (see [Live waits and checks](#live-waits-and-checks)). Only `flow-start-recording` and `flow-finish-recording` return the whole YAML as `flowFile`. A step call returns `recorded` — one summary line for the step it appended — plus a running `stepCount`. Read `recorded`: the recorder does not always store the tool call you made, and that line is where a rewrite shows up. To see the whole file mid-recording, read it at `savedTo`. A `savedTo` that comes back `null` means the write failed on your side. The step is still in the recording, so continue: the next step rewrites the whole file, and `flow-finish-recording` returns `flowFile` regardless.
7. Edit or reorder the YAML only after `flow-finish-recording`. An active remote recording can overwrite mid-recording edits.

## Start in the correct order

### iOS, Android, and Vega e2e flows

1. Call `flow-start-recording` before launching or touching the app.
2. Record a plain `restart-app` as the first non-echo action. Pass only the device id and app id. The recorder converts it to `launch:`.
3. Record `await-ui-element` for the real first screen immediately after restart.

Extra restart arguments prevent `launch:` conversion. An Android `activity`, for example, leaves a raw tool step and therefore a fragment.

Do not use splash content as a selector or landmark. Wait for the first real screen.

On iOS, only `restart-app` guarantees an instrumented launch. `launch-app` can foreground an uninstrumented process. Use [iOS selector recovery](reliability-and-recovery.md#ios-selector-recovery) when the tree is missing.

### Chromium e2e flows

**The app sets the window size; no boot argument overrides it.** Electron ignores `--window-size` — the size comes from the app's own `BrowserWindow` options, and Argent never resizes the window. Boot a fresh target with `boot-device` and `electronAppPath`, then take one `screenshot` and record its pixel dimensions: that capture size is the snapshot device class ([Flow YAML: Snapshots](flow-yaml.md#snapshots-and-standalone-runs)) and must match when CI replays. If the app sizes its window from host or session state, say so in the report.

After boot, start the recorder before the first in-app action. Record the first-screen wait. `restart-app` has no Chromium support, so the call errors and records nothing, and a recorded Chromium flow is always a fragment: its launch is written in during polish rather than captured, and any `executionPrerequisite` the recording declared must go with it. A launch-first flow must not carry one. During polish, add the matching launch:

```yaml
steps:
  - launch:
      chromium:
        path: ../../app
        args: ["--enable-feature-flag"]
```

The path is relative to `.argent/flows/`. Copy the live boot arguments verbatim, and omit `args` when the boot passed none. This packaging exception represents the boot already exercised live. It does not permit a rehearsed UI path.

### Fragments

Stage the entry state before recording. Then start with a precise `executionPrerequisite` that names UI, account, and platform state. Do not store a device id. Start recording before the fragment's first interaction.

## Record the first walkthrough

For Vega, first read [Flow YAML: Composition and platform limits](flow-yaml.md#composition-and-platform-limits). Vega is remote-driven and does not use touch gestures.

Reach each screen through the app's UI. Do not replace tested navigation with `open-url`. Starting the app is not navigation.

For every action:

1. **Discover without mutation.** Use `describe`, iOS native discovery, `debugger-component-tree`, or `screenshot`. Do not record discovery or `debugger-*` calls: `port` is not a device-bind key, so a recorded one replays against whatever Metro owns that port.
2. **Choose a durable target.** Prefer a stable id, then stable text or an accessibility label. On iOS, use native discovery for ids that trimmed accessibility output omits.
3. **Add an echo.** Name the current state, action, and expected outcome before the action can fail.
4. **Execute through `flow-add-step`.** Inspect the result and the `recorded` line immediately.
5. **Verify immediately.** Record outcome checks when their states first appear. After navigation, prove identity then readiness: record the identity check live, and add the readiness gate during polish.

### Record identity, then readiness, after every navigation

1. Record `await-ui-element visible` on an element unique to the destination.
2. If a specific control marks application readiness, record another visible wait on that control before the next action.
3. During polish, add `await: { idle: true }` after the identity check.

A shared tab bar, source element, or positional id does not prove navigation. `idle` cannot identify the screen or prove application data is ready. Keep the control wait because asynchronous loading can continue after stillness. If the screen intentionally moves, disclose it and gate the next action on a stable element. Read [Flow YAML: Prove a navigation](flow-yaml.md#prove-a-navigation-identity-then-readiness) for the directive semantics.

### Record absence in three steps

Use the same stable selector for both checks:

1. Record it as `visible`.
2. Record the action that removes it.
3. Record it as `hidden`.

Without step 1, `hidden` also passes for a typo or an element that never existed. A role-only or regex-only first locator does not establish a specific element.

### Taps

`flow-add-step` cannot receive a flow selector directly. Discover the element first, then record `gesture-tap` at its frame center; the live coordinates are transport for the gesture, not a final locator. The recorder reads the pre-tap tree and derives the selector in a fixed order — `id`, then `text`, then `role` — giving three outcomes. Read the `recorded` line after every tap, because only two of them warn. It names the derived form — a selector map, or the kept point:

1. **`tap: { id: ... }` or `tap: { text: ... }`** — the good case.
2. **`tap: { role: ... }`, appended with no warning.** An icon-only button with neither id nor visible label lands here. `role` matches as a case-insensitive substring, so a replay screen holding a second control of that role can win the [ranking](flow-yaml.md#the-runner-tree-is-not-the-discovery-tree) and the tap reports a pass on the wrong control.
3. **A kept raw point**, with a warning naming the reason and the retarget.

Treat outcomes 2 and 3 alike. Restore the source screen with direct MCP calls, record a corrected tap, then remove the weak step after finishing. Keep a point or a bare role only through the [coordinate fallback gate](reliability-and-recovery.md#coordinate-fallback-gate).

Never tap the on-screen keyboard through the recorder. Some platforms expose it as one large node, so replay can tap the wrong key while reporting success. Record text with `keyboard`.

### Typing

Record the focus tap, then record `keyboard` with `text`. A `keyboard` call carries `text` or `key`, never both. To submit, record a second `keyboard` step with `key: "enter"`. Verify the complete value with `describe` or an app validation marker.

**Never `describe` or `screenshot` a non-secure field you just filled from `{{secret:…}}`.** Only a password field is redacted; a plain text input hands the resolved value back into your context, and an API key or token typed into one is the ordinary case. Submit or navigate away first, then verify the resulting screen.

**`describe` reports focus on Chromium only.** iOS and Android leave it unset — it is a Vega/D-pad signal there — so those platforms have no live pre-typing focus check, and the value check afterwards is what proves the keys landed. On Chromium, read `focused` before recording `keyboard`.

If characters are lost, restore the field with direct calls. Do not record a duplicate typing step. Polish the valid pair into `type:`. Its replay focus wait reads the runner's own tree, which does report focus on iOS, Android, and Chromium, but an unconfirmed poll falls through to typing rather than failing — so retain the committed-value check. Store credentials as `{{secret:NAME}}`. Never record a literal credential.

### Scrolling and swiping

Record the required live gesture. During polish:

- Convert element-seeking movement to selector-based `scroll-to`.
- Retain a raw swipe only when the gesture itself is under test.

For every retained raw gesture, add an echo and a recorded result check.

### Live waits and checks

Record `await-ui-element` through `flow-add-step`. An unmet condition is not an error: the tool returns normally, `message` reports the step was added, and the only sign of failure is `toolResult.success: false` with a `note`. **The step is in the flow file.** Read `toolResult.success` after every recorded check.

When it is false, fix the selector or justified timeout, record the check again, and delete the failed step after `flow-finish-recording`. Do not leave both. A stale `hidden` whose selector matches nothing replays as a silent pass — the unfalsifiable gate that [Record absence in three steps](#record-absence-in-three-steps) exists to prevent. Never proceed as though the gate passed. See the `await-ui-element` section of `argent-device-interact` for the full live condition and selector reference.

The live tool and flow runner use different trees. A live wait can pass while its converted directive cannot resolve. Replay every conversion. Keep the raw tool only when its `pollIntervalMs` or `bundleId` is required. Live tools use `identifier`. Flow YAML uses `id`.

### Wrong turns

Stop immediately. Restore the last valid screen with direct MCP calls, not `flow-add-step`. Continue only from verified state. Remove the bad step after finishing. If recovery changed or skipped meaningful behavior, re-record that portion live.

## Finish and polish

Call `flow-finish-recording`, then read the saved YAML. Apply only meaning-preserving conversions:

| Recorded form                             | Finished form                                                      |
| ----------------------------------------- | ------------------------------------------------------------------ |
| focus tap + `tool: keyboard`              | `type:`                                                            |
| text `keyboard` + `key: enter` `keyboard` | submitted `type:` without Enter in its text                        |
| `tool: await-ui-element`                  | `await:` or `assert:`                                              |
| element-seeking movement                  | `scroll-to:`                                                       |
| coordinate tap or long-press              | strict selector after the fallback gate                            |
| `tool: gesture-pinch`                     | selector-based `pinch:` with `scale = endDistance / startDistance` |
| `tool: gesture-rotate`                    | selector-based `rotate:` with `by = endAngle - startAngle`         |
| sibling `tool: flow-execute`              | recorder-captured `run:`                                           |

Only these unrecorded insertions are allowed, at states observed live:

- A planned `snapshot:` for pixel-level evidence.
- `await: { idle: true }` after a navigation identity check.
- The Chromium launch that packages the live boot.

Keep raw forms only when conversion changes behavior. Examples include point-anchored or panning pinch, velocity-sensitive swipe, or rotation with a tested start angle, radius, pivot, duration, or speed. Keep screenshots for human evidence. Use `snapshot:` for automated visual comparison. Read [Flow YAML](flow-yaml.md) for syntax.

If polish reveals a missing action or structural check, restore its preceding state and record it. Do not add remembered behavior directly to YAML.

## Worked example

`FLOW` below abbreviates `name: "open-settings", project_root: "/Users/dev/AcmeNotes"`. Repeat both fields in every call.

```text
flow-start-recording { FLOW }
flow-add-echo { FLOW, message: "Restart Acme Notes; expect Home" }
flow-add-step { FLOW, command: "restart-app", args: "{\"udid\":\"ABC\",\"bundleId\":\"com.acme.notes\"}" }
# captured as: - launch: com.acme.notes
flow-add-step { FLOW, command: "await-ui-element", args: "{\"udid\":\"ABC\",\"condition\":\"visible\",\"selector\":{\"identifier\":\"home-screen\"}}" }
flow-add-echo { FLOW, message: "On Home; open Settings" }
flow-add-step { FLOW, command: "gesture-tap", args: "{\"udid\":\"ABC\",\"x\":0.91,\"y\":0.94}" }
# pre-tap capture resolves to: - tap: { id: settings-tab }
flow-add-step { FLOW, command: "await-ui-element", args: "{\"udid\":\"ABC\",\"condition\":\"visible\",\"selector\":{\"identifier\":\"settings-screen\"}}" }
flow-finish-recording { FLOW }
```

After meaning-preserving conversion:

```yaml
steps:
  - echo: Restart Acme Notes. Expect Home
  - launch: com.acme.notes
  - await: { visible: { id: home-screen } }
  - await: { idle: true }
  - echo: On Home. Open Settings
  - tap: { id: settings-tab }
  - await: { visible: { id: settings-screen } }
  - await: { idle: true }
```

## Blocking audit

Run these checks before replay:

```text
# Weak targets: coordinates, raw gestures, role-only selectors
rg -n '(\{ *x:|^ +(x|centerX|fromX|toX):|gesture-(tap|swipe|scroll|drag|pinch|rotate|custom))' .argent/flows/<name>.yaml
rg -n -B2 '^ +role:' .argent/flows/<name>.yaml
# Stored device ids
rg -n '(udid|device_id)' .argent/flows/<name>.yaml
# Positional ids and loose condition selectors
rg -n '(-selector-\d+|selector-\d+\b)' .argent/flows/<name>.yaml
rg -n '(visible|hidden|exists) *: *["'"'"'A-Za-z0-9]' .argent/flows/<name>.yaml
# Fixed waits and skipped navigation
rg -n '^\s*- wait:|open-url' .argent/flows/<name>.yaml
```

The condition grep matches a condition key with a scalar after it — `visible: Save` — and not `visible:` opening a map. Recorder output is always block style, so both forms are one line below their `await:`/`assert:`. It covers `when:` guards too, which take the same loose fallback.

Resolve every hit and confirm:

- Every element action uses a stable selector unless the fallback gate cleared and documented it.
- **No `role:` stands as the only key under a `tap:`/`long-press:`.** That is the recorder's silent fallback, which warned about nothing. Replace it, or clear it through the fallback gate. A `role:` beside another field or a scope (`within`, `after`, `next`) is deliberate and needs no defence.
- Every element-seeking gesture became `scroll-to`.
- No device id or literal credential remains.
- Every selector-bearing condition uses an explicit selector map without positional or data-derived values.
- Every fixed wait has an echo and a following hard check. Prefer a condition or `idle`.
- No `open-url` replaces tested navigation.
- Every snapshot is intentional, deterministic, non-mutating, and ready for reviewed baseline creation.
- The e2e launch and real first-screen gate are present. Only Chromium permits an inserted launch.
- Every screen change has a destination-only identity check and an `idle` readiness check. The two are repaired differently: record a missing identity check live on the restored screen, but add a missing readiness gate in YAML, because `await: { idle: true }` has no recorder form.
- Every `hidden` check follows a `visible` check on the same stable selector and the removing action. A proven containing screen is not a substitute, because it is no evidence the selector itself ever resolved.

## Replay

Run `flow-execute` on the complete YAML with the absolute project root. For a fragment, verify its prerequisite before setting `prerequisiteAcknowledged: true`.

`flow-execute` takes exactly one flow source: `name`, for a flow saved under `.argent/flows/`, or `flow_path`, an absolute path to any flow `.yaml`. `run:` targets and baselines resolve on the tool server's filesystem, beside the YAML it actually reads. `flow_path` therefore requires the agent and the tool server to share a filesystem and is refused when they do not. `name` still runs remotely, but the server receives only that one YAML in a fresh temp directory, so a `run:` target fails as a missing fragment and a `snapshot` fails for a missing baseline. Replay self-contained flows remotely; a composing or snapshotting flow needs one shared filesystem.

Manual rescue invalidates the pass. An `errored` step was never evaluated: an `idle` wait whose tree source could not be read, a step that threw, an unresolvable `run:` target, or a `launch:` that did not start the app. Read the reason — most name the environment, but a failed `launch:` is a verdict about the app. Unconfirmed focus is not in this class at all: the replay focus poll has no failure return, so a `type:` step whose focus was never confirmed is scored a **pass**, and only the value check after typing catches it.

**A passing step that carries a `warning` is a finding, not noise.** `await: { idle: true }` raises [six different warnings](flow-yaml.md#idle-readiness) and they do not share one meaning. Two say the screen was moving; one says the wait ran out mid-hold and is repaired by raising the step's `timeout:`; one says the tree stayed empty; one says the tree did hold still and only the screenshot pairs were missing, so the capture path is what to check; one says the step ended with no evidence either way. No report separates intended motion from a load that never finished. Read which one it is, look at that screen, disclose what you found, and confirm the following step targets a stable element rather than stillness.

A [selector-less gesture](flow-yaml.md#directives) raises a warning of a different shape, not one of those six: a tree-source outage left it unsettled, so it dispatched blind and the green says only that the gesture was sent. Restore the source, usually by relaunching the app so the instrumentation loads. Accept it only where the app serves no tree at all, such as the [injection-free iOS form](reliability-and-recovery.md#terminally-non-injectable-ios-apps).

One uninterrupted full pass completes a normal flow. `argent-qa-flows` requires two consecutive passes of unchanged YAML. For CI, use `argent flow run <name> [--platform ...]`; it exits non-zero on failure.
