# [Nutin](https://www.nutin.org)

`The structure of a framework. The freedom of vanilla.`

Nutin provides the structure and tooling you'd expect from a framework, while keeping the underlying web platform visible and giving you code ownership.

**Your app owns Nutin — not the other way around.** The source code lives alongside your application, so you can read it, modify it, and make it yours. `nutin-update` keeps your edits: when an update touches a file you changed, the new version is merged into yours.

Nutin is deliberately pragmatic and lightweight, with no runtime dependencies.

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
```

## Update Nutin

```bash
# update to latest version while preserving your changes
nutin-update
```

Your project must be committed first (git repository, no changes or untracked files), so an update can always be undone; `--allow-dirty` skips that check. Files you edited are merged three-way with `git merge-file`. Overlapping edits get conflict markers: the project won't build, and `nutin-update` won't run again, until they're resolved. `NUTIN-UPDATE-REPORT.md` lists merged and conflicting files.

## Add Feature

```bash
nutin-add <feature>
```

Features: `docker` (Dockerfile, nginx config, `docker:build`/`docker:run` scripts) and `markdown` (Markdown folders compiled into routed pages).

## Documentation

- [Documentation](https://www.nutin.org/docs)
