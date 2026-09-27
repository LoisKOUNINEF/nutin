# How to integrate AlpineJS?

This guide describes two ways to load [AlpineJS](https://alpinejs.dev) into a Nutin application - bundled from npm, or loaded from a CDN - and two ways to use it alongside Nutin.

## Load Alpine

### From npm

*Requires Nutin 2.1.1 or later.*

```bash
npm install alpinejs
npm install --save-dev @types/alpinejs
```

Alpine ships no types of its own: without `@types/alpinejs`, TypeScript fails.

Alpine needs `builder.esbuild.target` set to `es2020` (or later) in `nutin.config.js`.

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

Import Alpine in `main.ts` only, not in a component nor a view file.

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

### With npm

You start Alpine yourself, so you can set it from `main.ts`, right before `Alpine.start()`:

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

### With the CDN script

Declare it in `index.html`, since `cdn.min.js` starts Alpine before `main.ts` ever runs:

```html
<!-- src/index.html -->
<body>
    <main id="app" x-data="{ count: 0 }"></main>
</body>
```

#### Advanced: declaring x-data in main.ts

Above approach requires hand-editing index.html because of the auto-starting cdn.min.js - before main.ts ever runs.

Swap to Alpine's non-auto-starting ESM build to set #app's x-data from TypeScript instead.

1. Replace the "Load Alpine" script tag with an inline import that doesn't call .start():

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

2. Add it in the `Window` interface

```ts
// src/app/globals.d.ts
declare interface Window {
    Alpine: {
        start(): void;
    };
}
```

3. Set x-data on #app and call window.Alpine.start() yourself as the last step of your bootstrap:

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
