---
name: argent-qa-flows
description: Create repeatable QA regression E2E tests as Argent flows from test cases, tickets, or acceptance criteria. Use when the user asks to generate or preserve an automated regression scenario, with deterministic setup, stable targets, executable structural or visual evidence, and two consecutive full passes. For one-off UI checks or replayable paths without acceptance criteria, use argent-test-ui-flow or argent-create-flow. Supports iOS, Android, Chromium, and Vega (Fire TV), where recorded tv-remote steps replace touch directives. Apple TV and Android TV are unsupported; use argent-tv-interact there and report the limitation.
---

# Create a QA regression flow

Load `argent-create-flow` as the authoring engine. Follow its required references for recorder syntax, selectors, polish, platform exceptions, and repair. This skill adds the QA contract and completion gate.

**Vega** supports every item below: `launch: { vega: ... }`, `await:`/`assert:` selectors, `snapshot:`, and `idle` all run there. Only the touch directives are missing, because Vega is remote-driven. Navigate with recorded `tool: tv-remote` steps and type with `tool: keyboard`, which leaves item 5 with nothing to govern. A D-pad path is relative to where focus already is, so gate every move with item 4's identity check rather than assuming the cursor landed. Read `argent-tv-interact` for focus reading and remote navigation.

**Apple TV and Android TV are out of scope.** The runner does not reject touch directives there, so they fail at the gesture layer instead of with authoring guidance. Use `argent-tv-interact` and report the limitation.

## Definition of done

A QA flow is complete only when:

1. The first non-echo step is `launch:`. In-flow setup proves a deterministic data baseline. Repeated runs do not accumulate artifacts or require manual cleanup.
2. The first walkthrough recorded every action and live structural check. Only the three documented polish insertions are unrecorded.
3. Every requirement maps to a hard `await:`, `assert:`, or reviewed `snapshot:`. Echoes and screenshots are not verdicts. A negative check needs the same stable selector established as visible earlier.
4. Every screen change has destination identity followed by `idle` readiness.
5. Targets satisfy the stable-selector and coordinate-fallback rules. QA keeps coordinates only for genuinely unlabeled targets. Vacuous on Vega, which has no coordinate targets.
6. The unchanged YAML passes twice with the same runner. Pass 1 starts with fresh mobile Argent services, and pass 2 follows immediately.

## 1. Define the test contract

Before touching the app, write a compact table. Restate it in the final report. Include:

- App, platform, and named start state.
- Ordered user actions.
- One row for each expected outcome, persistence rule, or absence claim.
- Stable executable evidence for each row.
- Required data and side effects.

Use structural checks for semantic state, snapshots for pixels, and both for mixed requirements. One behavioral scenario becomes one `qa-<area>-<behavior>` flow.

Do not invent a material value or weaken ambiguity. Choose the strongest UI-verifiable reading and report it. Ask when the choice changes test meaning.

Make repeated runs deterministic:

1. Inspect the required baseline without mutation.
2. If the account is dirty, record a safe reset or seed flow. Alternatively, include safe normalization in setup.
3. After setup navigation, echo the named baseline and hard-check it before the first scenario mutation. Use `assert:` or a destination `await:` that fully proves the baseline.
4. Prefer to restore the baseline at the end.

Use `run:` for a separately recorded reset or seed flow. No other fixture mechanism exists. Ask before cleanup that creates or deletes meaningful user data outside the request.

### Compact example

Ticket: select Dark in Settings. Verify Dark is selected, Light is absent, and the screen renders in dark mode.

| Contract row          | Action                   | Evidence                                                                    | State effect          |
| --------------------- | ------------------------ | --------------------------------------------------------------------------- | --------------------- |
| Signed-in Home        | Launch                   | `await: { visible: { id: home-screen } }`, then `await: { idle: true }`     | Existing account      |
| Open Settings         | Tap `settings-tab`       | `await: { visible: { id: settings-screen } }`, then `await: { idle: true }` | None                  |
| Prove Light selected  | Inspect Settings         | `assert: { visible: { id: theme-light-selected } }`                         | Fails if already Dark |
| Prove Dark selected   | Tap `theme-dark-option`  | `await: { visible: { id: theme-dark-selected } }`                           | Theme becomes Dark    |
| Prove Light absent    | Inspect settled screen   | `assert: { hidden: { id: theme-light-selected } }`                          | None                  |
| Verify dark rendering | Inspect settled screen   | `snapshot: settings-dark`                                                   | None                  |
| Restore baseline      | Tap `theme-light-option` | `await: { visible: { id: theme-light-selected } }`                          | Next run starts clean |

The initial Light check establishes the selector used by the later `hidden` check. The final restore makes pass 2 independent.

## 2. Record the scenario

Follow `argent-create-flow`'s start order and live-authoring cycle. Record each structural contract check when its state appears.

A snapshot has no recorder form. Inspect its stable state during the walkthrough, then add the planned snapshot during polish. If direct recovery changes state, re-record the affected behavior. A recovered walkthrough is not proof.

## 3. Make evidence discriminating

- **State change:** prove the new state and the old state's absence when both can otherwise match.
- **Cancel/persistence:** cross the commit boundary. After cancel or save, leave, re-enter, then verify the stored state: unchanged after cancel or updated after save.
- **Absence:** prove the containing screen and record the same stable selector as `visible`, then the action, then `hidden`. Do not add an unestablished `hidden` check only to strengthen a positive baseline. In a collection, viewport absence is not global absence. Use fixed seeded position, count, empty state, or other collection-wide evidence.
- **Overlays:** use the create-flow [obscured-target procedure](../argent-create-flow/references/reliability-and-recovery.md#obscured-targets-and-persistent-overlays).
- **Repeated controls:** prefer an id. Otherwise use flow-only `within` with a stable container. Use `text.in` to prove rendered membership inside that container.
- **Dynamic content:** assert controlled state or stable app chrome. Use anchored structure for unavoidable dynamic values and disclose the dependency.
- **Visual state:** snapshot only a correct, settled, deterministic screen. Use full screen for global changes and `cropOn` for one component.

Never put acceptance evidence inside `when:`. Use `when:` only for optional setup that reconverges to the required path.

## 4. Finish and audit

Complete the create-flow polish and blocking audit. Then:

1. Map every contract row to an executed action or hard check.
2. Build a navigation table with one row per screen change, naming both the identity gate and the readiness gate. A row missing either is a blocking defect.
3. Confirm setup and end state permit an immediate second run.

| Action             | Destination | Identity                  | Readiness |
| ------------------ | ----------- | ------------------------- | --------- |
| Tap `settings-tab` | Settings    | `settings-screen` visible | `idle`    |

The two are repaired differently. A missing identity check must be recorded live on the restored screen. A missing `idle` check is added in YAML, because `await: { idle: true }` has no recorder form and is one of `argent-create-flow`'s three permitted polish insertions. Re-record any missing action or other structural check.

## 5. Prove two consecutive passes

After the last edit and audit, set the streak to zero:

1. Choose one runner for both passes. Use `flow-execute` locally or `argent flow run <name> --platform <platform>` for CI. Switching runners resets the streak.
2. Seed, review, and freeze snapshot baselines. Baseline updates do not count as passes.
3. Before mobile pass 1, recycle Argent services for this flow's device: two warm passes are correlated evidence, because a fixed timing margin can pass twice simply because environment speed did not change. Scope `stop-all-simulator-servers` to `devices: [<device>]`. Never omit the scope — a bare call is the machine-wide sweep, and step 7 restarts this proof often enough to reap every other agent's devices repeatedly. Use the MCP call for `flow-execute`, or `argent run stop-all-simulator-servers --devices <device>` from the standalone runner's install. The reset must not change app or account data. For Chromium, let the runner boot the declared app and omit `device`. Vega owns no recyclable Argent services, so the teardown is a no-op there and both passes are warm.
4. Run from the flow's launch and setup without baseline-update mode. Count a pass only when `ok: true` and every acceptance check executed. A false `when:` can skip optional setup only. An errored step does not advance the streak, and the count mixes two kinds — read each reason. One that could not run (an unreadable tree under `idle`, an unresolvable `run:` target) is environment: fix it and rerun. **A failed `launch:` also scores `errored`, and it is a verdict about the app** — an app that no longer installs or starts is the regression this test exists to catch, so report it instead of rerunning.
5. Resolve every passing-step warning before completion. `await: { idle: true }` raises [six different warnings](../argent-create-flow/references/flow-yaml.md#idle-readiness), so read which one it is first. Two say the screen was moving. One says the wait ran out mid-hold and needs a larger `timeout:`. One says the tree stayed empty. One — **settled on the UI tree alone** — says the hierarchy did hold still and only the screenshot pairs were missing, so inspect the capture path rather than the app's rendering. One says the step ended with no evidence either way. Inspect the screen, disclose the cause, and verify that surrounding acceptance checks use stable elements rather than stillness. A [selector-less gesture](../argent-create-flow/references/flow-yaml.md#directives) — a coordinate `tap`/`long-press`, or a `pinch`/`rotate` with no `on:` — warns in a different shape: a tree-source outage left it unsettled, so it dispatched blind and the green says only that the gesture was sent. Restore the tree source, usually by relaunching the app so the instrumentation loads, and rerun. Accepting that warning needs an app that serves no tree, which cannot satisfy this contract anyway.
6. Run the same YAML again immediately with the same runner. Do not manually reset app or account data.
7. Reset the streak after any failure, edit, re-recording, baseline update, or state-changing manual recovery. Repair through `argent-create-flow`, audit again, and restart with fresh services.

Finish only when the streak reaches two. If the intended runner is unavailable, report proof as blocked. If product behavior fails, keep the strong check and report the regression. Never weaken it to obtain green output.

Record the runner and fresh-service setup used.

## 6. Report

Report:

- Flow name, path, platform, and standalone command.
- Contract rows mapped to actions and checks.
- Navigation table.
- Baseline setup, end-state restoration, and accepted data dependencies.
- Both pass results, runner, fresh-service setup, and resolved warnings.
- Snapshot scope, reviewed baseline status, and mismatch tolerance.
- Coordinate or raw-gesture exceptions.
- Remaining manual judgment or blocker.
