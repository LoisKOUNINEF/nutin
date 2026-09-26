# How to integrate AlpineJS?

This guide describes two ways to integrate [AlpineJS](https://alpinejs.dev) into a Nutin application manually.

## Load Alpine

Add Alpine's CDN script to `src/index.html`'s `<head>`, pinned to an exact version:

```html
<!-- src/index.html -->
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
</head>
```

*Note:* If you're using Nutin's `docker` feature, you'll have to [add the CDN source to nginx CSP map](http://localhost:9090/docs/use-docker-feature#adding-origins-in-csp-map).

## Approach 1: Keeping Alpine separated from Nutin

This pattern keeps Alpine state completely isolated; it is never touched by Nutin, so it's safe ground for Alpine to own. 

- You can mount it through Nutin's [global layout service](https://nutin.org/en/docs/mount-global-components) `registerGlobals` API. This gives the Alpine root a clear entrypoint in `main.ts` alongside the rest of the app's global components:

```ts
// src/app/components/globals/alpine-root/alpine-root.component.ts
import { Component } from '../../../../core/index.js';

const templateFn = () => `
    <button @click="count++">Increment</button>
    <span x-text="count"></span>
`;

export class AlpineRootComponent extends Component {
    constructor(mountTarget: HTMLElement) {
        super({ mountTarget, tagName: 'div' });
    }

    protected override onBeforeRender(): void {
        this.element.setAttribute('x-data', '{ count: 0 }');
    }
}
```

```ts
registerGlobals({
    after: [{ component: AlpineRootComponent, id: 'alpine-root' }],
});
```

- A plain sibling `<div>` hand-authored directly in `index.html` still works:

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

## Approach 2: Using Alpine state inside Nutin

To let `@click`/`x-text`/etc. *inside* component and view templates read and mutate shared Alpine state, declare `x-data` directly on `#app` itself - it is permanent for the life of the page:

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

### Advanced: declaring `x-data` in `main.ts`

[Approach 2](#approach-2-sharing-alpine-state-with-nutin-s-rendered-content) above requires hand-editing `index.html` because of the auto-starting `cdn.min.js` - before `main.ts` ever runs.

Swap to Alpine's non-auto-starting ESM build to set `#app`'s `x-data` from TypeScript instead.

1. Replace the "Load Alpine" script tag with an inline import that doesn't call `.start()`:

```html
<!-- src/index.html -->
<head>
    <!-- ... -->
    <!-- This replaces the `cdn.min.js` script tag from "Load Alpine" -->
    <!-- Use one or the other, not both. -->
    <script type="module">
        import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/module.esm.js';
        window.Alpine = Alpine;
    </script>
</head>
```

```ts
// src/app/globals.d.ts
declare interface Window {
    Alpine: {
        start(): void;
    };
}
```

2. Set `x-data` on `#app` and **call `window.Alpine.start()`** yourself as the last step of your bootstrap:

```ts
// src/app/main.ts
document.addEventListener('DOMContentLoaded', () => {
    // ...

    document.getElementById('app')!.setAttribute('x-data', '{ count: 0 }');
    window.Alpine.start();
});
```

## Important

**`x-data` roots should never live inside a component's or view's own rendered subtree.**

If the component re-renders, it replaces that element's `innerHTML`, wiping out the `x-data` root 
and its state along with it.

This is also true when an ancestor's re-render, or a view navigation tears down and rebuilds the whole subtree.

## Notes

- This CDN approach adds zero build-tool involvement. 
- Bundling [AlpineJS](https://alpinejs.dev) as an npm dependency instead requires several steps and is not fully functional in Nutin.
