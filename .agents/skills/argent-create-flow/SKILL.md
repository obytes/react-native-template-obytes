---
name: argent-create-flow
description: Create, record, edit, replay, or repair reusable Argent flow YAML files. Use when the user asks to record or replay a repeatable device path, set up profiling or an A/B comparison, or invoke the authoring engine behind argent-qa-flows. Also use before repeating three or more interactions. For one-off UI checks, acceptance-driven regression tests, or screen video, use argent-test-ui-flow, argent-qa-flows, or argent-screen-recording respectively.
---

# Create an Argent flow

An Argent flow is a replayable sequence in `.argent/flows/<name>.yaml`.

For a saved QA test case, ticket, or acceptance criterion, load `argent-qa-flows` first. It adds deterministic setup, acceptance evidence, and two-pass proof.

## Read the relevant reference

- Before creating or changing a flow, read [Live authoring](references/live-authoring.md) completely.
- When polishing, composing, or manually reviewing YAML, read [Flow YAML](references/flow-yaml.md). For Vega, read its platform limits before recording remote or keyboard tools.
- On capture warnings, raw coordinates, unavailable trees, mistimed transitions, overlays, or replay failures, read [Reliability and recovery](references/reliability-and-recovery.md).

## Non-negotiable rules

1. **Record the first walkthrough.** Start the recorder before the first launch or in-app action. Do not reconstruct a rehearsed path.
2. **Record checks when their states appear.** Record `await-ui-element` live, then convert it during polish. An echo records intent or diagnostic context, not app behavior or a verdict. A screenshot is human evidence, not an executable verdict. For absence, record the same selector as `visible`, perform the removing action, then record it as `hidden`.
3. **Use semantic targets.** Prefer a strict id, then stable text or an accessibility label. Use `scroll-to` for off-screen elements. Resolve every raw-point warning immediately through the [coordinate fallback gate](references/reliability-and-recovery.md#coordinate-fallback-gate).
4. **Prove every screen change.** Record a destination-only identity check. During polish, follow it with `await: { idle: true }`. Stillness does not prove identity, and `idle` can pass with a warning.
5. **Polish only executed behavior.** Convert recorded steps without changing their meaning. Record any missing action or structural check live. The only unrecorded insertions are a planned `snapshot:`, a navigation `await: { idle: true }`, and the documented Chromium packaging `launch:`.
6. **Replay the final YAML end to end.** A normal flow needs one uninterrupted full pass. `argent-qa-flows` requires two consecutive passes.

### Stable selectors

A stable selector is fixed by app code and survives account, data, time, count, order, and every locale and environment the flow supports. Prefer ids such as `settings-screen`. Do not gate on values such as `Today`, `Item 4`, usernames, counters, or timestamps.

### Flow-only selector scopes

During polish, use `within`, `after`, and `next` to disambiguate repeated elements. Read [Flow YAML: Relational scopes](references/flow-yaml.md#relational-scopes) for their frame-based semantics and failure cases.

## Workflow

1. Choose the flow type:
   - **e2e:** the first non-echo step is `launch:`. The flow controls process start.
   - **fragment:** there is no leading launch. Declare a precise `executionPrerequisite`.
2. Follow [Live authoring](references/live-authoring.md): start, record one verified step at a time, finish, polish, audit, and replay.
3. Report the file, replay command, result, prerequisite or side effects, and every coordinate or raw-gesture exception.

## Proactive recording

Before repeating three or more interactions, tell the user and start a recording. Record that run and replay it afterward. A completed path cannot be recorded retroactively.

## Repair

When replay fails, follow [Reliability and recovery](references/reliability-and-recovery.md). Inspect the first divergence, correct the smallest justified unit, audit, and replay the full flow. Stop after two unsuccessful correction cycles. Never weaken a requested check to obtain a pass.
