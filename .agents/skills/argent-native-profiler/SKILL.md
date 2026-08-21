---
name: argent-native-profiler
description: Native profiling for CPU hotspots, UI hangs, memory issues. iOS via xctrace; Android via Perfetto. Use when diagnosing native-level performance issues.
---

## 1. Tools

- `native-profiler-start` — start profiling on a booted device. iOS: xctrace recording for CPU, hangs, and leaks.
- `native-profiler-stop` — stop the profiler and export trace data to timestamped XML files.
- `native-profiler-analyze` — parse exported trace data and return a structured bottleneck payload.
- `profiler-stack-query` — drill into parsed data: hang stacks, function callers, thread breakdown, leak details.
- `profiler-load` — list and reload previous trace sessions from disk for re-investigation.

---

## 2. Platform Support

- **iOS**: Backend: Xcode Instruments via `xctrace` on a booted simulator or connected device. Requires Xcode command-line tools on PATH. Surfaces CPU hotspots, UI hangs, and memory leaks (instruments `Leaks` table).
- **Android**: Backend: Perfetto via `adb shell perfetto` + an in-process WASM trace-processor engine. Surfaces CPU hotspots and UI hangs, with per-hang jank reason codes, a main-thread state breakdown with `blocked_function` attribution, and a GC overlap annotation. Also reports an RSS-growth signal for memory pressure; treat it as a hint to confirm manually, not a confirmed leak. The target app must be debuggable or include `<profileable android:shell="true"/>` in its manifest for `perf_sample` callstacks to be captured.

---

## 3. Investigation Patterns

After `native-profiler-analyze` surfaces findings, use `profiler-stack-query` to drill into root causes:

- **Hang detected** → `profiler-stack-query` mode=`hang_stacks` for full native call chains → mode=`function_callers` for the suspected function → read native source.
- **CPU hotspot** → `profiler-stack-query` mode=`thread_breakdown` for per-thread distribution → mode=`function_callers` for the dominant function.
- **Memory leak** → `profiler-stack-query` mode=`leak_stacks` filtered by `object_type` for responsible frames and libraries.
  - iOS: if leaks come back unattributed (responsible frame `<Call stack limit reached>`), re-run `native-profiler-start` with `malloc_stack_logging: true`. This cold-launches the app with Malloc Stack Logging so leaks carry a real allocation backtrace (responsible frame + library). It restarts the app and adds overhead, so use it only when you need leak attribution — not for CPU/hang passes.

After presenting findings, ask the user whether to investigate further, implement fixes, or stop. After applying fixes, always re-profile the same scenario and compare with `profiler-load`. Report honestly whether the target metric improved, regressed, or stayed flat. If the fix showed no net benefit or introduced regressions elsewhere, say so and reconsider.

**Tip:** For reproducible before/after comparisons, record the interaction sequence as a flow using the `argent-create-flow` skill before the first profiling run. Replay with `flow-execute` on subsequent runs to eliminate interaction variance.

> **Note:** The `argent-react-native-profiler` instructs to start native profiling automatically alongside React profiling. This skill's workflow and investigation patterns apply in both cases.

---

## 4. Workflow

**Complete all steps in order — do not break mid-flow.**

### Step 0: Ensure the target app is running

The `native-profiler-start` tool **auto-detects** the running app on the device.
You do not need to derive `app_process` manually — just make sure the app is launched.

1. If the app is already running on the device, skip to Step 1 (do not pass `app_process`).
2. If the app is not running, use `launch-app` with the correct bundle ID first.
3. Only pass `app_process` explicitly if the tool reports multiple running user apps and you need to disambiguate.

> **Note**: If multiple build flavors are installed (dev, staging, prod), the tool will detect whichever one is currently running. If both are running, it will ask you to specify.

### Step 1: Start recording

Call `native-profiler-start` with `device_id` (iOS UDID or Android serial). The tool auto-detects the running app and saves the trace to `/tmp/argent-profiler-cwd/` with a timestamped filename.
Let the user interact with the app or drive interaction via simulator tools (see `argent-device-interact` skill).

### Step 2: Stop and export

Call `native-profiler-stop` with `device_id`. iOS sends SIGINT to xctrace, waits for trace packaging, and exports CPU, hangs, and leaks data to XML — check `exportDiagnostics` for any export warnings. Android sends SIGTERM to the on-device perfetto daemon, polls `/proc/<pid>` until it exits, then `adb pull`s the `.pftrace` to the host.

### Step 3: Analyze

Call `native-profiler-analyze` with `device_id`. Returns a markdown report with bottlenecks categorized as CPU hotspots, UI hangs, or memory leaks, sorted by severity.

### Step 4: Present findings and ask about next steps

Present a concise summary of the key findings. Then follow the "After analysis" guideline — ask whether to investigate further with query tools, implement fixes, or stop.

### Step 5: Drill-down investigation

Use `profiler-stack-query` to investigate specific findings. See §3 Investigation Patterns for chaining guidance.

### Step 6: Reload previous sessions

To revisit a previous trace:

1. Call `profiler-load` mode=`list` to see available sessions.
2. Call `profiler-load` mode=`load_native` session_id=`<timestamp>` device_id=`<UDID>` to re-parse the XML files.
3. Use `profiler-stack-query` to investigate the reloaded data.

---

## 5. Understanding Results

Bottlenecks are categorized by severity:

- **RED**: CPU functions taking >15% of total time, all UI hangs, and **attributed** memory leaks (those with a resolved responsible frame). These require immediate attention.
- **YELLOW**: CPU functions taking 3-15% of total time, and **unattributed** memory leaks (`<Call stack limit reached>`, no library — see the memory-leaks caveat below). Worth investigating but may be acceptable.

Each bottleneck type indicates a different class of problem:

- **CPU hotspots**: Native functions consuming excessive CPU time. Look for tight loops, expensive computations, or redundant work.
- **UI hangs**: Main thread blocked long enough to cause visible jank or unresponsiveness. Often caused by synchronous I/O, heavy layout passes, or lock contention.
- **Memory leaks**: Objects allocated but never freed. Common causes include retain cycles, unclosed resources, or forgotten observers. Argent records via `xctrace --attach`, which has no malloc-stack history, so on the simulator most leaks come back **unattributed** (`<Call stack limit reached>`, no library) and are dominated by benign system allocations — these are reported as a low-confidence YELLOW summary, not confirmed RED leaks. For attributed stacks, capture with malloc stack logging enabled at launch.

---

## 6. Important Caveats

- **Simulator vs device**: Simulator profiling reflects host Mac performance, not real device hardware. Use device profiling for accurate CPU timings and memory behavior.
- **xctrace availability (iOS)**: Requires Xcode command-line tools installed. Verify with `xcrun xctrace version`.
- **Profiler overhead**: xctrace instrumentation adds CPU load. If `JSLexer`, `JSONEmitter`, or Hermes runtime internals dominate the JS thread in CPU hotspot results, those reflect profiler overhead — not app work. Discount those entries when evaluating findings.
- **Run-to-run variance**: Small fluctuations in CPU percentages between runs are normal. Treat only consistent directional changes (across 2+ runs or >15% delta) as actionable signal.
- **Live data variability**: If the app fetches live API data, different responses between runs change rendering workload independently of code changes. Note when data-dependent screens show variance.
