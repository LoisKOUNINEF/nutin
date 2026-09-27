# How to integrate AlpineJS?

This guide describes two ways to load [AlpineJS](https://alpinejs.dev) into a Nutin application - from a CDN, with zero build-tool involvement, or from npm, bundled with the rest of your app - and two ways to use it alongside Nutin.

## Load Alpine

### From a CDN

Add Alpine's CDN script to `src/index.html`'s `<head>`, pinned to an exact version:

```html
<!-- src/index.html -->
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
</head>
```

`cdn.min.js` starts Alpine on its own as soon as it loads.

*Note:* If you're using Nutin's `docker` feature, you'll have to [add the CDN source to nginx CSP map](https://nutin.org/docs/options-and-features/use-docker-feature#adding-origins-in-csp-map).

### From npm

*Requires Nutin 2.1.1 or later, where `dev`/`serve`/`build` bundle npm dependencies too.*

```bash
npm install alpinejs
npm install --save-dev @types/alpinejs
```

Alpine ships no types of its own: without `@types/alpinejs`, TypeScript fails with `TS7016: Could not find a declaration file for module 'alpinejs'`.

Alpine needs `builder.esbuild.target` set to `es2020` (or later) in `nutin.config.js`. It's the default for projects created with Nutin 2.1.1+. Projects created before keep their own value (`es2015`), which breaks every Alpine expression at runtime:

```js
// nutin.config.js
esbuild: {
    // ...
    target: ['es2020'],
},
```

Import Alpine in `src/app/main.ts` and start it yourself, as the last step of your bootstrap:

```ts
// src/app/main.ts
import Alpine from 'alpinejs';

document.addEventListener('DOMContentLoaded', async () => {
    // ...
    new App();

    Alpine.start();
});
```

Alpine is then served from your own bundle: no CSP change is needed with the `docker` feature.

## Approach 1: Keeping Alpine separated from Nutin

This pattern keeps Alpine state completely isolated; it is never touched by Nutin, so it's safe ground for Alpine to own. 

- You can mount it through Nutin's [global layout service](https://nutin.org/en/docs/api/mount-global-components) `registerGlobals` API. This gives the Alpine root a clear entrypoint in `main.ts` alongside the rest of the app's global components:

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

To let `@click`/`x-text`/etc. *inside* component and view templates read and mutate shared Alpine state, declare `x-data` directly on `#app` itself - it is permanent for the life of the page.

- With the CDN script, declare it in `index.html`, since `cdn.min.js` starts Alpine before `main.ts` ever runs:

```html
<!-- src/index.html -->
<body>
    <main id="app" x-data="{ count: 0 }"></main>
</body>
```

- With npm, you start Alpine yourself, so you can set it from `main.ts` instead, right before `Alpine.start()`:

```ts
// src/app/main.ts
document.getElementById('app')!.setAttribute('x-data', '{ count: 0 }');
Alpine.start();
```

Then, inside any component's or view's own `.html` template, use directives with **no local
`x-data`** — they inherit the scope from `#app` by normal DOM ancestry, and the state survives navigating between views:

```html
<!-- e.g. home.view.html -->
<button @click="count++">Increment</button>
<span x-text="count"></span>
```

## Important

**`x-data` roots should never live inside a component's or view's own rendered subtree.**

If the component re-renders, it replaces that element's `innerHTML`, wiping out the `x-data` root 
and its state along with it.

This is also true when an ancestor's re-render, or a view navigation tears down and rebuilds the whole subtree.

## Notes

- The CDN approach adds zero build-tool involvement. 
- With npm, import Alpine in `main.ts` only, not in a component or view file: `main.ts` is never imported by testin-nutin or by SEO files generation, so Alpine never runs outside a real browser.
