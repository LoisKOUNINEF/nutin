# How to integrate AlpineJS?

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

**Do not** place `x-data` roots inside a Nutin component's or view's own rendered subtree — a future
`render()` call would wipe them out along with any Alpine state.

### Notes

- Pin an exact Alpine version rather than `@3`/`latest` to avoid silent breakage on upstream releases.
- This CDN approach adds zero build-tool involvement. 
- Bundling Alpine as an npm dependency instead requires several steps and is not fully functional in Nutin.
