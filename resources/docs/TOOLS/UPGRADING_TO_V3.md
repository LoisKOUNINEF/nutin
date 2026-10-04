# Upgrading from 2.x to 3.0

`nutin-update` only handles minor and patch updates, so a 2.x app is upgraded by hand: replace the files Nutin generates, then migrate `src/app`. The full list of changes is in the [changelog](https://nutin.org/changelog).

## 1. Find your own changes outside `src/app`

Generate a fresh app with **your current 2.x version** and the same options and features, then compare it with your project. Leave out `src/app`, `src/styles`, `config/`, `public/` and `README.md`, which Nutin doesn't manage.

```bash
npm i @nutin/cli@<your 2.x version>
npx nutin-new reference -pm npm   # same package manager, --js-only if your app uses it
cd reference && npx nutin-add docker   # each feature your app has
```

Every file that differs is a change you made (or a config value you set). Note them: you'll reapply them in step 3.

## 2. Generate a 3.0 reference app

Install the 3.0 CLI and generate an app with the same options and features. The package manager flag is now `-p`:

```bash
npm i -g @nutin/cli@3
nutin-new reference -p npm
cd reference && nutin-add docker
```

## 3. Replace the generated files

From the 3.0 reference app, copy into your project:

- `src/core/` and `tools/`, replacing them entirely, so files removed in 3.0 go too;
- `src/index.html` and `.nutin-meta.json`.

Then merge by hand:

- `package.json`:
  - take the 3.0 `scripts` (`build:prod` uses `--prod`, new `testin-nutin:only`);
  - take the `devDependencies`: TypeScript `^7.0.2`, `esbuild` 0.28, `jsdom` 30, `chokidar` 5, and remove `live-server`;
  - keep your own name, version and dependencies;
  - then reinstall.
- `tsconfig.json`: remove `baseUrl` and the empty `paths` (TypeScript 7 doesn't accept `baseUrl`).
- `nutin.config.js`: keep your values.
- Reapply the changes you found in step 1, e.g. a customized `tools/docker/Dockerfile.template`.

A `Dockerfile.template` without the new `__MARKDOWN_SOURCES_PLACEHOLDER__` line still renders, as long as the `markdown` feature isn't used.

## 4. Migrate `src/app`

Do the type imports first. The build stops at the TypeScript errors before it gets to the template warnings.

- **Types are globals.** Remove `ComponentConfig`, `ComponentProps`, `Routes`, `RouteGuard` and the other [listed types](https://nutin.org/changelog) from your `core/index.js` imports. Delete an import line that only contained types. Classes and functions (`Component`, `View`, `Navigation`…) are imported as before.
- **Templates.** Tag every `template`/`templateFn` with `html`, and add `html` to the import:

  ```ts
  import { Component, html } from '../../../core/index.js';

  const templateFn = (task: ITask) => html`__TEMPLATE_PLACEHOLDER__`;
  ```

  Drop `.join('')` after mapped `html` results. Wrap HTML you insert on purpose in `raw()`. The build warns about every untagged template that contains `${}`.

  Two patterns to look for:
  - **Pre-escaped data** (`'&lt;div&gt;'`, e.g. code snippets) is now escaped a second time and shows up as `&lt;div&gt;`. Store the real characters (`'<div>'`) and let `html` escape them.
  - **Attributes inserted as a string** in a tag (`<a ${active ? 'data-event="click:go"' : ''}>`) are filtered like `raw()` there, so `data-event` and the other binding attributes are dropped. Write the two variants as two `html` templates instead.
- **`main.ts`.** Match the new generated file:
  - delete the `beforeunload` block that calls `Service.destroyAll()`;
  - replace the `nutinConfig.i18n` check with `await initI18n()`.

  The old i18n check still works, but it references `I18nService`, so i18n stays in the bundle even when it's off (about 3 KB minified on the tutorial app).
- **`data-event` handlers.** Only links, form submits and submit buttons get `preventDefault()` now. If a handler relied on it for anything else, call `@event`'s `preventDefault()` yourself.
- **`HttpClient`.** Check endpoints that rely on string concatenation, encoded `/` (`%2F`), or empty responses. See the changelog's HttpClient section.

### Data saved by 2.x

In 2.x, `data-event` tokens such as `@value` passed HTML-escaped values: typing `a & b` gave `a &amp; b`. If your app saved those values (localStorage, a server), the stored text contains entities, and 3.0 displays them as typed: `a &amp; b`. Decode them once, or fix them where they're stored.

### Styles

New 3.0 apps don't ship a CSS reset. Your `src/styles` isn't touched, so an upgraded app keeps the one it has.

## 5. Check

```bash
npm run build          # no TypeScript errors, no untagged-template warnings
npm run build:prod
npm run testin-nutin
```

With the `docker` feature, `docker:build` regenerates `tools/docker/Dockerfile` and `nginx.conf` from their templates. Then click through your app: forms, links and anything that shows user data.
