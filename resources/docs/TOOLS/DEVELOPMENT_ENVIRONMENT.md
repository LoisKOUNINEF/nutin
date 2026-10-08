# Development environment

All serve on port 9090 by default. Pass `-- --port 3000` (or set `PORT=3000`) to change it.

```bash
# build (dev environment) and serve
<pm> run serve

# build (prod environment) and serve
<pm> run serve:prod

# without build (use existing 'dist' output)
<pm> run serve:only

# build (dev environment) and serve with live reload
<pm> run dev
```

## Dev server

Nutin's own server (`tools/dev/serve.js`, no dependency) listens on `127.0.0.1`. A busy port fails with a hint to pass another one.

- A page navigation without a matching file gets the app (`index.html`), even when the URL contains a dot (`/users/john.doe`). A missing asset gets a 404.
- Prerendered SEO pages are served from their folder's `index.html`.
- Only `dev` reloads open pages, after each successful rebuild. `serve`/`serve:prod` don't.

## Watcher

`dev` rebuilds when a file in `src/`, `config/` or `public/` (or `nutin.config.js`, or a markdown source folder) is changed, added or deleted. A failed rebuild is reported and the watcher keeps running.

The watcher doesn't install an opt-in feature's dependencies (Tailwind, `markdown`) on its own: run `<pm> run build -- -y` once first.
