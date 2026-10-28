# How do I create an app?

```bash
nutin-new                # asks for the project's name and package manager
nutin-new my-app         # asks for the package manager
nutin-new my-app -p pnpm # asks nothing
```

The project is created in a new `my-app` folder in the current directory. The command stops if that folder already exists.

## Options

| Option | Does |
|---|---|
| `[projectName]` | The project's folder and `package.json` name: lowercase letters, numbers, `-` and `_`. Asked if omitted (default `my-nutin-app`) |
| `-p, --package-manager <manager>` | `npm`, `yarn`, `pnpm` or `bun`. Asked if omitted (default `npm`) |
| `--js-only` | A plain JavaScript project. TypeScript is the default |
| `--extension [surface]` | A Chrome and Firefox extension, shown in the `side-panel` or a `popup`. Asked if no value is given. See [How do I create a browser extension?](./HOWDOI_CREATE_A_BROWSER_EXTENSION.md) |

`--js-only` and `--extension` are fixed at creation: they can't be switched later.

## What it does

1. Generates the project from Nutin's templates: your app's starter files (`src/app/`), Nutin's source (`src/core/`), the tooling (`tools/`), `nutin.config.js`, and the docs (`README.md`, `GETTING_STARTED.md`, `AGENTS.md`).
2. Writes `package.json`, `tsconfig.json`, and `.nutin-meta.json`.
3. Runs `git init`, when git is available. Nothing is committed: make the first commit yourself. `nutin-update` needs the project committed before it changes anything.
4. Installs the dependencies with the chosen package manager.

**Keep `.nutin-meta.json` in the repository**: `nutin-update` and `nutin-add` read it.

## Next steps

```bash
cd my-app
npm run serve   # build, then serve on http://localhost:9090
npm run dev     # the same, rebuilding and reloading on each change
```

An extension project has no dev server: build it with `npm run build`, then load it in the browser (see [How do I create a browser extension?](./HOWDOI_CREATE_A_BROWSER_EXTENSION.md)).

The generated `GETTING_STARTED.md` walks through the project's structure, and `AGENTS.md` sums up the framework for coding agents (and for you).
