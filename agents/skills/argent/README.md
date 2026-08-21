# Argent Skill (MCP Server)

## Description
Argent by Software Mansion — MCP server for AI agents to control iOS Simulator / Android Emulator, debug, and profile React Native apps.

## Install
```bash
npx @swmansion/argent init
```

## Capabilities (via MCP)
- Simulator/emulator control: launch, tap, swipe, type, navigate
- Debugging: view hierarchy, console logs, network requests, React component tree
- Profiling: React + native iOS profiles, UI hangs, memory leaks

## Commands (agent-invoked via MCP)
- `argent:simulator:launch` — Launch app on simulator
- `argent:simulator:tap` — Tap at coordinates
- `argent:simulator:swipe` — Swipe gesture
- `argent:debug:view-hierarchy` — Inspect view hierarchy
- `argent:debug:network` — Inspect network requests
- `argent:profile:record` — Record performance profile
