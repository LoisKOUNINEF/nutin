# [Nutin](https://www.nutin.dev)

`Framework structure. Vanilla freedom.`

Nutin provides the structure and tooling you'd expect from a framework, while keeping the underlying web platform visible and giving you code ownership.

## Install

Requires Node.js 24 or later.

```bash
# install package globally
npm install -g @nutin/cli
```

## New App

```bash
# create a new app
nutin-new # or create-nutin-app

# without global installation
npx @nutin/cli

# options
nutin-new my-app -p pnpm   # package manager (npm, yarn, pnpm or bun), asked otherwise
nutin-new my-app --js-only # plain JavaScript project (TypeScript is the default)
nutin-new my-app --extension # Chrome and Firefox extension
```

## Add Feature

```bash
nutin-add <feature>
```

- `docker` (Dockerfile, nginx config, `docker:build`/`docker:run` scripts)
- `markdown` (Markdown folders compiled into routed pages).
- Cannot be used if the project is a browser extension (`nutin-new --extension`)

## Update Nutin

```bash
# update to latest version while preserving your changes
nutin-update
```

- Your project must be committed first (`--allow-dirty` to skip), so an update can always be undone.
- Files you edited are merged three-way with `git merge-file`.
- Overlapping edits get conflict markers: the project won't build, and `nutin-update` won't run again, until they're resolved.
- `NUTIN-UPDATE-REPORT.md` lists merged and conflicting files.

## Documentation

- [Documentation](https://www.nutin.dev/docs)
