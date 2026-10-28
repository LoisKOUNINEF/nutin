# How do I install Nutin?

Nutin is a command-line tool, `@nutin/cli`. It generates your project, and updates it later. 

Your app doesn't depend on it at runtime: Nutin's source is copied into the project (`src/core/`, `tools/`).

It requires **Node.js 24 or later**.

## Install it globally

```bash
npm install -g @nutin/cli
```

This installs four commands:

| Command | Does |
|---|---|
| `nutin-new` (or `create-nutin-app`) | Creates a project: see [How do I create an app?](./HOWDOI_CREATE_AN_APP.md) |
| `nutin-add <feature>` | Adds a feature to the current project: see [How do I add a feature?](./HOWDOI_ADD_A_FEATURE.md) |
| `nutin-update` | Updates the current project to the installed version: see [How do I update a Nutin project?](./HOWDOI_UPDATE_A_NUTIN_PROJECT.md) |
| `nutin` | The same three, as subcommands: `nutin new` (the default), `nutin add`, `nutin update` |

Each one has `--help` and `--version`.

## Without installing

```bash
npx @nutin/cli            # creates a project, like nutin-new
npx @nutin/cli add docker
npx @nutin/cli update
```

## Updating the CLI

```bash
npm install -g @nutin/cli@latest
```

Updating the CLI doesn't change your projects. Run `nutin-update` in each project to bring it to the new version.
