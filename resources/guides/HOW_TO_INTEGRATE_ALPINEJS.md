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

### Sharing Alpine state with Nutin's rendered content

To let `@click`/`x-text`/etc. *inside* component and view templates read and mutate shared Alpine state, declare `x-data` directly on `#app` itself:

```html
<!-- src/index.html -->
<body>
  <main id="app" x-data="{ count: 0 }"></main>
</body>
```

Then, inside any component's or view's own `.html` template, use directives with **no local
`x-data`** — they inherit the scope from `#app` by normal DOM ancestry:

```html
<!-- e.g. home.view.html -->
<button @click="count++">Increment</button>
<span x-text="count"></span>
```

Every view and component root gets appended into (or removed from) `#app` as a child, but the element `#app` itself is permanent for the life of the page.

Alpine's mutation observer re-binds freshly-inserted elements to the still-alive `#app` scope automatically.

Reach for the sibling-of-`#app` pattern below for state that's genuinely independent of anything Nutin
renders (e.g. a global UI toggle unrelated to routed content); reach for `x-data` on `#app` when
component/view markup itself needs to read or write that state.

### Keeping Alpine markup outside Nutin's mount root

Nutin only ever creates and updates DOM inside the element it mounts a component into (`#app` by default).

This pattern keeps Alpine state completely isolated — content inside `#app` can't
read it, since a sibling isn't an ancestor of `#app`'s children. 

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

**Do not** place `x-data` roots inside a Nutin component's or view's own rendered subtree (i.e. as
part of what `generateTemplate()` returns) — a `render()` call replaces that element's
`innerHTML`, wiping out the `x-data` root and its state along with it. This is true even if the
component itself never calls `render()` again: an ancestor's re-render, or a view navigation
(which always `destroy()`s the old view), tears down and rebuilds the whole subtree regardless of
what the component itself does.

### Notes

- Pin an exact Alpine version rather than `@3`/`latest` to avoid silent breakage on upstream releases.
- This CDN approach adds zero build-tool involvement. 
- Bundling Alpine as an npm dependency instead requires several steps and is not fully functional in Nutin.
