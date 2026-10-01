# [Nutin](https://www.nutin.org)

`The structure of a framework. The freedom of vanilla.`

Nutin provides the structure and tooling you'd expect from a framework, while keeping the underlying web platform visible and giving you code ownership.

**Your app owns Nutin — not the other way around.** The source code lives alongside your application, so you can read it, modify it, and make it yours. `nutin-update` never overwrites your edits: when an update touches a file you changed, you get a diff to merge instead.

Nutin is deliberately pragmatic and lightweight, with no runtime dependencies.

## Install

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
```

## Update Nutin

```bash
# update to latest version while preserving your changes
nutin-update
```

## Add Feature

```bash
nutin-add <feature>
```

## Documentation

- [Repository documentation](https://github.com/LoisKOUNINEF/nutin/tree/main/docs/API.md)
