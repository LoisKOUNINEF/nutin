# How do I use AlpineJS?

Nutin strongly supports [AlpineJS](https://alpinejs.dev). This is a manual integration pattern.

## Recommended approach: CDN

### Load Alpine

Add Alpine's CDN script to `src/index.html`'s `<head>`, pinned to an exact version:

```html
<!-- src/index.html -->
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
</head>
```

The `cdn.min.js` build calls `Alpine.start()` automatically — no extra init script needed.

### Keep Alpine markup outside Nutin's mount root

Nutin only ever creates and updates DOM inside the element it mounts a component into (`#app` by default).

Any markup that lives as a **sibling of `#app`** is never touched by Nutin, so it's safe ground for Alpine to own:

```html
<!-- src/index.html -->
<body>
  <main id="app"></main>

  <div x-data="{ count: 0 }">
    <button @click="count++">Increment</button>
    <span x-text="count"></span>
  </div>
</body>
```

**Do not** place `x-data` roots inside a Nutin component's own rendered subtree — a future
`render()` call would wipe them out along with any Alpine state.

### Notes

- Pin an exact Alpine version rather than `@3`/`latest` to avoid silent breakage on upstream releases.
- This CDN approach adds zero build-tool involvement. 

Bundling Alpine as an npm dependency instead requires several steps - see [bundling AlpineJS as an npm dependency](#alternative-bundling-alpinejs-as-an-npm-dependency) below.

## Alternative: bundling AlpineJS as an npm dependency

Alpine can also be installed as a regular npm dependency and imported directly in
`src/app/main.ts`, letting Nutin's own builder (esbuild) bundle it — no CDN script tag needed.
This works, but only through the production build, and requires one `nutin.config.js` change.

```bash
npm install alpinejs
npm install --save-dev @types/alpinejs # alpinejs ships no types of its own
```

```ts
// src/app/main.ts
import Alpine from 'alpinejs';
// ...existing imports

Alpine.start();
```

The same [sibling-of-`#app` placement rule](#keep-alpine-markup-outside-nutins-mount-root)
applies to the HTML markup — nothing changes there.

### Required config change: raise the esbuild target

Nutin's default `nutin.config.js` ships `builder.esbuild.target: ['es2015']`. Alpine's expression
evaluator relies on getting the real native `AsyncFunction` constructor at runtime. Bundling with an ES2015 target causes esbuild to downlevel native `async function` syntax, which breaks that lookup.

Fix: raise the target to one that supports native async functions (ES2017+; ES2020 was used and
verified):

```js
// nutin.config.js
builder: {
  esbuild: {
    // ...
    target: ['es2020'], // was: ['es2015']
  },
},
```

With that change, `npm run build:prod && npm run serve:prod` produces a working bundle — Alpine's
reactivity and Nutin's own router/render cycle were both verified to work correctly and stay
fully isolated from each other, exactly as with the CDN approach.

**Note:** `esbuild.target` is a project-wide build setting, not Alpine-specific.

### Dev mode does not work out of the box

`npm run dev` / `npm run serve` do **not** bundle — `tools/dev/dev-serve.js` just runs `tsc`
(no bundling) and serves the emitted `main.js` as-is via `live-server`, which doesn't resolve
bare npm specifiers or expose `node_modules`. The bare `import Alpine from 'alpinejs'` fails at
the browser's module loader, and because it's a top-level static import, `main.ts` fails to
load entirely — **Nutin's own app fails to boot too**, not just Alpine:

```
TypeError: Failed to resolve module specifier "alpinejs". Relative references must start
with either "/", "./", or "../".
```

If you need this npm-bundled setup, use `build:prod`/`serve:prod` for local testing, or modify the builder, or stick to the CDN approach above.
