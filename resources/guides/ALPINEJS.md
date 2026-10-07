# How to integrate AlpineJS?

This guide describes two ways to load [AlpineJS](https://alpinejs.dev) into a Nutin application - bundled from npm, or loaded from a CDN - and three ways to use it alongside Nutin.

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
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.17.4/dist/cdn.min.js"></script>
</head>
```

`cdn.min.js` starts Alpine on its own as soon as it loads.

*Note:* With Nutin's `docker` feature, Alpine's standard builds don't run under its Content Security Policy. See [With the docker feature (CSP)](#with-the-docker-feature-csp).

### With the docker feature (CSP)

The `docker` feature serves your app with a Content Security Policy that allows only your own scripts (`script-src 'self'`). Alpine's standard builds (`alpinejs` from npm, `cdn.min.js`) evaluate your expressions with the `Function` constructor, which that policy blocks: Alpine loads, but no directive works, and the console shows `EvalError: Evaluating a string as JavaScript violates the following Content Security Policy directive because 'unsafe-eval' is not an allowed source of script`.

Use Alpine's CSP build instead, rather than adding `'unsafe-eval'` to the policy (it would weaken the protection against injected scripts). Everything in this guide works with it.

- From npm: install `@alpinejs/csp` instead of `alpinejs`, and import it the same way:

    ```bash
    npm install @alpinejs/csp
    npm install --save-dev @types/alpinejs
    ```

    ```ts
    // src/app/main.ts
    import Alpine from '@alpinejs/csp';
    ```

    It has no type definitions of its own; it shares Alpine's:

    ```ts
    // src/app/globals.d.ts
    declare module '@alpinejs/csp' {
        import Alpine from 'alpinejs';
        export default Alpine;
    }
    ```

- From a CDN: load the CSP build's `cdn.min.js`, and [add its origin to the nginx CSP map](https://nutin.org/docs/options-and-features/use-docker-feature#adding-origins-in-csp-map), scoped to the version's path (`script-src 'self' https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.17.4/`):

    ```html
    <script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/csp@3.17.4/dist/cdn.min.js"></script>
    ```

- Use version 3.15.0 or later: earlier CSP builds can't read inline expressions like `x-data="{ count: 0 }"` or `@click="count++"`, only components registered with `Alpine.data()`.
- Expressions can't reach globals such as `document`: `@click="document.getElementById('menu')…"` fails with `Undefined variable: document`. Put that code in a method of an `Alpine.data()` component or an `Alpine.store()`, and call the method from the expression. See [Alpine's CSP build](https://alpinejs.dev/advanced/csp) for what it supports.
- The inline `<script type="module">` of [Declaring x-data in main.ts](#advanced-declaring-x-data-in-main-ts) is blocked too (inline scripts aren't allowed). Load Alpine from npm instead: you set `#app`'s `x-data` and start Alpine from `main.ts` the same way.

## Approach 1: Keeping Alpine separated from Nutin

This pattern keeps Alpine state completely isolated; it is never touched by Nutin, so it's safe ground for Alpine to own. 

- You can mount it through Nutin's [global layout service](https://nutin.org/en/docs/api/mount-global-components) `registerGlobals` API. This gives the Alpine root a clear entrypoint in `main.ts` alongside the rest of the app's global components:

```ts
// src/app/components/globals/alpine-root/alpine-root.component.ts
import { Component, html } from '../../../../core/index.js';

const templateFn = () => html`
    <button @click="count++">Increment</button>
    <span x-text="count"></span>
`;

export class AlpineRootComponent extends Component {
    constructor(mountTarget: HTMLElement) {
        super({ mountTarget, tagName: 'div', templateFn });
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

- You start Alpine yourself, so you can set it from `main.ts`, right before `Alpine.start()`:

```ts
// src/app/main.ts
document.getElementById('app')!.setAttribute('x-data', '{ count: 0 }');
Alpine.start();
```

- Hand-authoring `main` directly in `index.html` still works:

```html
<!-- src/index.html -->
<main id="app" x-data="{ count: 0 }"></main>
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

#### Advanced: Declaring x-data in main.ts

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
        import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.17.4/dist/module.esm.js';
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

## Alternative: Holding Alpine state inside a component

*Requires Nutin 3.0.0 or later.*

A component can hold its own `x-data` root if its parent registers it with a `key` (or, for catalog items, with `trackBy`). 

When the parent re-renders, a kept child is moved into the new template as-is instead of being recreated, so its Alpine state survives.

```ts
// src/app/components/counter/counter.component.ts
import { Component, html } from '../../../core/index.js';

const templateFn = () => html`
    <button @click="count++">Increment</button>
    <span x-text="count"></span>
`;

export class CounterComponent extends Component {
    constructor(mountTarget: HTMLElement) {
        super({ mountTarget, templateFn });
    }

    protected override onBeforeRender(): void {
        this.element.setAttribute('x-data', '{ count: 0 }');
    }
}
```

```ts
// In the parent component or view
public registerChildren(): ComponentConfig[] {
    return [
        { selector: 'counter', key: 'counter', factory: (el) => new CounterComponent(el) },
    ];
}
```

The same holds for catalog items tracked with `trackBy`, as long as the item itself didn't change.

A changed item, or a child whose `key` changed, is recreated, and its state starts over.

## With a11y-elements

Alpine directives work inside [a11y-elements](https://nutin.org/guides/a11y-elements) components that stay where they're written, like form controls: e.g. `@change` on the checkbox of an `<a11y-switch>`.

Overlays (`<a11y-modal>`, `<a11y-drawer>`, `<a11y-dropdown>`…) need a different setup: they move themselves to `<body>`, out of `#app`, so they leave its `x-data` scope. Directives on or inside them can't see that state any more (`modal is not defined`).

- Give the overlay its own `x-data`, so Alpine still processes it in `<body>`.
- Keep the state it shares with the page in an `Alpine.store()`, which any component can reach as `$store`.
- Open it through its `open` attribute, from a store method: the overlay closes itself (its close button, Escape, the backdrop), so a state of your own tracking whether it's open would go stale.

```ts
// src/app/main.ts, before Alpine.start() (with the CDN script: before new App())
Alpine.store('ui', {
    count: 0,
    open(id: string) {
        document.getElementById(id)?.setAttribute('open', '');
    },
});
```

```html
<!-- e.g. home.view.html -->
<button @click="$store.ui.count++">Add one</button>
<button @click="$store.ui.open('cart')">Open cart</button>

<a11y-modal id="cart" x-data>
    <h2>Cart</h2>
    <p x-text="'Items: ' + $store.ui.count"></p>
</a11y-modal>
```

The method works with both builds (see [With the docker feature (CSP)](#with-the-docker-feature-csp)). With the CDN script, Alpine is `window.Alpine`.

The component or view whose template contains the overlay still has to remove it on re-render and destroy, as with any overlay: see [Use overlays inside components](https://nutin.org/guides/a11y-elements#use-overlays-inside-components).

## Important

**An `x-data` root inside Nutin's rendered tree only survives while the element holding it is kept.**

It is reset when:

- The component holding it renders again: its own `render()`, or a `listenToRenderEvents()` event, rebuilds its content.
- It isn't kept across an ancestor's re-render: it has no `key`/`trackBy`, or any component between it and the re-rendering ancestor has none. An unkeyed component is recreated along with everything inside it.
- It is part of a view's own template: views are destroyed on every navigation. Never declare `x-data` in a view's template, only in keyed components or on `#app` ([Approach 2](#approach-2-using-alpine-state-inside-nutin)).
