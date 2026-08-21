---
name: argent-screen-recording
description: Record a video of an iOS simulator or Android emulator/device screen using argent MCP tools. Use when the user asks to record the screen, capture a video of a flow, interaction, or animation, produce a screen recording, or document app behavior as a video clip.
---

## 1. Tools

- `screen-recording-start` — start capturing the screen of a booted device to a video file. Frames come from the same simulator-server backend that `screenshot` and the interaction tools already use, and are encoded live to h264 mp4 (constant 30 fps, device-native resolution).
- `screen-recording-stop` — stop the capture, finalize the container, and retrieve the video as a downloadable artifact (`video.hostPath` for co-located clients).

One recording per device at a time; different devices can record concurrently. Recording does not disturb anything else reading the device — a preview window can stay open on the same screen.

---

## 2. Critical: never leave a recording running

A recording does not stop itself before its `timeLimitSeconds` cap, so a forgotten one keeps capturing until the cap fires — holding the recording session, wasting disk, and delaying the video you are waiting on (and with `trimStatic: false` it comes back padded with dead air). Two safety nets exist — use both:

1. **Set yourself a reminder the moment the recording starts.** You know the expected capture length (the interaction you are about to drive). Immediately after `screen-recording-start` returns, schedule a wake-up for that expected end time using whatever your harness provides — a built-in reminder/wakeup or scheduled-task tool if you have one, otherwise a background shell running `sleep <expected-seconds>` whose completion notification pulls you back. When it fires, call `screen-recording-stop`. Do not rely on remembering.
2. **Read the tool-result notes.** While a recording is running, every argent tool result carries a `NOTE:` reminding you it is still going and how to stop it. If the note says the recording already ended (time limit hit), still call `screen-recording-stop` — that is what hands you the file.

---

## 3. Workflow

1. Ensure the target device is booted and the app is in the state you want the video to open on (`list-devices`, `launch-app`, `argent-device-interact`).
2. Call `screen-recording-start` with `udid` and a `timeLimitSeconds` slightly above the expected interaction length (default 180, max 600). Taps and swipes are drawn into the video by default (see the touch-visualizer note below); pass `showTouches: false` for a clean raw-screen capture.
3. Set the end-of-recording reminder described in §2 — this step is not optional.
4. Drive the interaction to capture: gestures, navigation, typing (`argent-device-interact`). Prefer `run-sequence` for tight multi-step interactions so tool-call latency does not pad the video.
5. Call `screen-recording-stop` with the same `udid`. It returns `{ video, durationMs, wallClockMs?, trimmedMs?, warning? }`; `video` is an artifact whose resolved path points at the durably-saved file (see below). The video is already final when stop returns (the watermark is stamped during capture, not in a second pass), so stop takes well under a second.
6. Check `warning`: it reports cap-triggered stops, early encoder exits, a dropped frame stream, and possibly-truncated containers. Verify the file plays (or at least has a sane size) before presenting it to the user.

**Where the file lands (durable, not scratch).** Unlike most argent artifacts (which live in a disposable temp cache the OS reclaims), a finished recording is saved durably on the **client** into `<project>/.argent/recordings/` — the project being the nearest ancestor of the client's working directory with a `.git`/`package.json`/`.argent`, or `~/.argent/recordings/` when the client isn't inside a project. This holds even for a remote `argent link` tool-server: the mp4 is written on the client host, not the server. The destination can be changed with the `recordings.directory` configuration (`argent config set recordings.directory <dir>`, global by default, `--scope project` for a per-repo choice; project wins when both are set) — the value may be absolute, `~`-prefixed, or relative to the project root, and is always resolved on the client host. The saved name is `screen-recording-<device>-<timestamp>.mp4`; if that name is already taken the new file lands beside it as `… (2).mp4` rather than overwriting. Because these files persist in the working tree, mention the path to the user (and note that they are untracked — add them to `.gitignore` or clean them up if they shouldn't be committed).

**Static-frame trimming (on by default).** Stretches where the screen does not change are collapsed: the first second of each still stretch is kept so pauses read naturally, then unchanged frames are dropped until something moves again (a change of even a couple of pixels counts). So you can leave a recording running across slow steps, waits, or thinking time without padding the clip with dead air — a 40-second session with 5 seconds of real activity comes back as a ~5-7 second video. When trimming removed anything, stop also returns `wallClockMs` (real elapsed time) and `trimmedMs` (how much was cut); `durationMs` is always the length of the video you actually get. Pass `trimStatic: false` to `screen-recording-start` when you want a faithful real-time recording (e.g. to measure how long something took on screen).

**Touch visualizer (on by default).** Every interaction argent drives is drawn straight into the video: a pulse marks each tap, a fading comet trail follows swipes and drags, and paired markers show the two contact points of a pinch or rotate. This makes a recording self-explanatory — a viewer can see _where_ each gesture landed rather than watching the UI react to an invisible finger. It is rendered by simulator-server into the frame stream (nothing is composited host-side), so it costs nothing extra and never appears in a `screenshot`. Pass `showTouches: false` to `screen-recording-start` to record the raw screen with no overlay (e.g. when capturing exactly what the user would see). If simulator-server cannot enable it, the recording still succeeds and stop returns a `warning` saying touches are not shown.

---

## 4. Platform notes and limits

- **What can be recorded**: anything simulator-server drives — iOS simulators, Android emulators, and physical Android devices. The only length limit is `timeLimitSeconds` (max 600).
- **The timeline is paced to a steady 30 fps**: a device only emits a frame when its screen changes, so captured frames are re-paced onto a fixed timeline rather than bunching up. With static-frame trimming off (`trimStatic: false`) that timeline is wall-clock accurate — a completely still screen still comes back as a full-length video (compressing to almost nothing) and `durationMs` matches the time you actually recorded. With trimming on (the default, see §3) still stretches past the grace window are collapsed, so `durationMs` is the trimmed video length and `wallClockMs` carries the real elapsed time.
- **Android**: records at the device's native resolution; secure screens (DRM, some password fields) come out black.
- **Unsupported**: tvOS simulators, physical iPhones, Chromium apps, Vega/Fire TV, and remote (`remote:`-prefixed) simulators — none of them expose a readable frame stream. For a single still frame use `screenshot`; for a replayable interaction script use `argent-create-flow` instead of a video.
- **ffmpeg is required**: it is the encoder, so `screen-recording-start` fails up front with an install hint if it is missing (`brew install ffmpeg`). It is resolved from `PATH` plus the usual Homebrew prefixes.
- **Watermark**: the Argent logo + "By @swmansion" is stamped bottom-left while encoding, faint (20% opacity) and per-pixel contrast-matched to the background (light logo over dark UI, dark logo over light UI). On by default — turn it off with `argent disable video-watermark` (re-enable with `argent enable video-watermark`). The flag is read when the recording starts.
