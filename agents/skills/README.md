# Available MCP Skills

Each subfolder corresponds to a skill that can be loaded on demand by the agent.
The skill provides a set of commands (e.g., `expo:ios`, `clerk:auth:url`) that map to npm scripts or helper utilities.

Current skills:
- expo – dev server, device emulators, EAS builds
- clerk – auth URL, session, signOut, refresh
- testing – unit (jest), e2e (maestro), query devtools, coverage
- lint – eslint (fix), type-check
- mmkv – storage clear/inspect helpers
- i18n – locale sync, add, missing keys
- build/release – version bump, changelog, release prepare
- argent – (placeholder) Argent state‑management helpers
- generators – feature and UI component scaffolding

To add a new skill, create a folder under `agents/skills/` and document its commands in a `README.md` inside that folder.
