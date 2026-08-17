# Testing matrix (packages/nutin)

A machine-oriented reference for exhaustively testing `packages/nutin` (`@nutin/cli`) end to end: every creation flag, every package manager, every post-generation `nutin.config.js` toggle, every `nutin-add`/`nutin-update` flow, and every generated script (`build`, `build:prod`, `dev`, `serve`, `generate`, `testin-nutin` + variants).

Written to be read and executed by an LLM/agent working on a contribution, not as a narrative human tutorial — dense, factual, with exact commands and flag values rather than prose explanation.

- [`PLAN.md`](./PLAN.md) — methodology: why full combinatorial coverage, how to execute it, environment gotchas, what "done" looks like.
- [`MATRIX.md`](./MATRIX.md) — the exact dimensions, flag/config combinations, and commands.

This documents the CLI's *creation/config/flow* surface. For the test *toolkit* shipped inside every generated app (`testin-nutin` itself — assertions, spies, mocks, coverage), see [`/docs/TESTING.md`](../TESTING.md) instead.

**This reflects the CLI as of version 2.0.0.** Re-derive current flags/features/scripts from source before trusting anything below at face value — `lib/src/common/feature-registry.mjs`, `lib/src/create-app/context-builder.mjs`, and `lib/src/common/package-json-helper.mjs` are the actual source of truth.

