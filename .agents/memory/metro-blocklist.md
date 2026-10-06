---
name: Metro blockList for skills directories
description: Metro crashes when watched directories are deleted during a session
---

## Rule
Always add `/.local[/\\]skills[/\\]/` to the Metro `blockList` in `metro.config.js`.

**Why:** Metro watches the entire monorepo root (`workspaceRoot`). When agent-skills temp directories like `.local/skills/.old-agent-inbox-*` are created and then deleted mid-session, Metro throws `ENOENT: no such file or directory, watch ...` and crashes the Expo workflow.

**How to apply:** Add to `BLOCK_LIST_PATTERNS` in `artifacts/learn-app/metro.config.js` alongside the existing `@napi-rs` patterns.
