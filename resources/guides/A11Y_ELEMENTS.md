# How to use a11y-elements?

This guide describes how to use [a11y-elements](https://nutin.org/en/a11y-elements) in a Nutin application - bundled from npm, or loaded from a CDN - and how to use it inside Nutin components.

a11y-elements is a set of framework-agnostic accessibility Custom Elements. They are Light DOM only, and bring behavior rather than a themed UI kit: you style real markup with your own CSS.

## Install from npm

*Requires Nutin 2.1.1 or later.*

```bash
npm install a11y-elements
```

Import each element you use by its own subpath, in `src/app/main.ts`. There is no default export: `import 'a11y-elements'` alone fails.

```ts
// src/app/main.ts
import 'a11y-elements/overlays/dropdown';
import 'a11y-elements/components/spinner';
```

The package ships its own types. Importing an element's subpath also types exact-tag lookups, such as `document.querySelector('a11y-spinner')`.

Keep these imports in `main.ts`, not in a component or view file. With `generateSEOFiles`, see also [Pre-rendered overlays](#pre-rendered-overlays).

## Styles

Default styles are never auto-injected. Load them once, from `src/styles/main.scss`:

```scss
// src/styles/main.scss
@use "pkg:a11y-elements/a11y.css";
```

Every visual value is a `--a11y-<component>-<token>` CSS custom property, so retheming is plain CSS:

```scss
:root {
    --a11y-spinner-color: var(--primary);
}
```

## Use elements in templates

Elements are plain markup in any component's or view's `.html` template:

```html
<!-- e.g. home.view.html -->
<a11y-spinner></a11y-spinner>
```

## Use overlays inside components

Overlays (`<a11y-dropdown>`, `<a11y-modal>`, `<a11y-drawer>`, ...) move themselves to `<body>` as soon as they are connected, even while closed. When the elements are already defined, that happens **during** the component's render - before Nutin processes `data-i18n` and `data-event` in its template.

So, for any content inside an overlay:

- Translate text by interpolating `I18nService.translate` in the template, not with `data-i18n`.
- Handle clicks by delegation on the overlay itself, not with `data-event`.
- Look the overlay up by `id` in the whole `document`, not in `this.element`.
- Remove it when the component is re-rendered or destroyed, with a11y-elements' `removeOverlaysWithin()`: it no longer lives inside the component's element.

```html
<!-- src/app/components/menu/menu.component.html -->
<button type="button" id="menu-anchor" aria-haspopup="menu" data-i18n="menu.open"></button>
<a11y-dropdown id="menu-dropdown" anchor="menu-anchor">
    <a href="/" role="menuitem">${translate('home')}</a>
    <a href="/about" role="menuitem">${translate('about')}</a>
</a11y-dropdown>
```

```ts
// src/app/components/menu/menu.component.ts
import { Component, I18nService, Navigation, html } from '../../../core/index.js';
import { removeOverlaysWithin } from 'a11y-elements/core';

const translate = (key: string) => I18nService.translate(`menu.${key}`);

const templateFn = () => html`__TEMPLATE_PLACEHOLDER__`;

const DROPDOWN_ID = 'menu-dropdown';

export class MenuComponent extends Component {
    private dropdown: HTMLElement | null = null;

    constructor(mountTarget: HTMLElement) {
        super({ templateFn, mountTarget });
    }

    // Runs while the previous render is still in place: its dropdown, now in <body>,
    // is found from where it was written and removed before a fresh one is built.
    protected override onBeforeRender(): void {
        removeOverlaysWithin(this.element);
        super.onBeforeRender();
    }

    protected override onAfterRender(): void {
        this.dropdown = document.getElementById(DROPDOWN_ID);

        if (this.dropdown) {
            const onClick = (event: Event) => this.onItemClick(event);
            this.dropdown.addEventListener('click', onClick);
            this.eventListeners.push([this.dropdown, 'click', onClick]);
        }
        super.onAfterRender();
    }

    protected override onBeforeDestroy(): void {
        removeOverlaysWithin(this.element);
        this.dropdown = null;
        super.onBeforeDestroy();
    }

    private onItemClick(event: Event): void {
        const item = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[role="menuitem"]');
        if (!item) return;
        event.preventDefault();
        Navigation.navigateTo(item.getAttribute('href') ?? '/');
    }
}
```

Listeners pushed to `this.eventListeners` are removed along with the component's own.

`removeOverlaysWithin(host)` removes every overlay written anywhere inside `host`, even once it has moved to `<body>`, including the overlays of child components. A component or view that keeps children across re-renders (a `key` or `trackBy`) would remove the overlays of those kept children too. Call it on an element around your own overlays instead:

```ts
// The view's own overlays are wrapped in <div class="home__overlays"> in its template.
private removeOwnOverlays(): void {
    const own = this.element.querySelector('.home__overlays');
    if (own) removeOverlaysWithin(own);
}
```

Once moved, a dropdown is wrapped in a `.a11y-dropdown-wrapper` element labelled by its anchor, which you can target from the component's `.scss`:

```scss
// src/app/components/menu/menu.component.scss
.a11y-dropdown-wrapper[aria-labelledby='menu-anchor'] {
    --a11y-dropdown-color-background: var(--surface);
}
```

## Important

- **Never put `data-i18n` on an `<a11y-*>` element itself.** It sets the element's `textContent`, wiping out the markup the element builds.
- **Open and close overlays through the `open` attribute** (`setAttribute('open', '')` / `removeAttribute('open')`), not the `.open` property. A property set before the element is defined shadows its accessor for good.

## Translate built-in strings

A few English strings end up in accessible names and announcements (e.g. `Loading` on `<a11y-spinner>`, `Close dialog` on modal close buttons). Replace them with `setStrings()`, after translations are loaded and on every language change:

```ts
// src/app/main.ts
import { setStrings } from 'a11y-elements/core';

const applyA11yStrings = () => setStrings({
    loading: I18nService.translate('a11y.loading'),
    closeDialog: I18nService.translate('a11y.close-dialog'),
});

document.addEventListener('DOMContentLoaded', async () => {
    await I18nService.initTranslations();
    applyA11yStrings();
    I18nService.onLanguageChange(applyA11yStrings);
    new App();
});
```

With the matching keys in e.g. `src/app/a11y/locales/en.json`:

```json
{
    "loading": "Loading",
    "close-dialog": "Close dialog"
}
```

Elements already on the page update right away. See [a11y-elements' README](https://github.com/LoisKOUNINEF/a11y-elements#translating-built-in-strings) for every key.

## SEO files generation

With `generateSEOFiles` enabled, pre-rendered pages contain the `<a11y-*>` tags before their elements are defined. Hide overlays until then, so their content never flashes inline:

```scss
a11y-dropdown:not(:defined) {
    display: none;
}
```

### Pre-rendered overlays

When the app starts, an overlay defined by the imports in `main.ts` immediately moves out of the pre-rendered markup to `<body>`. The first view then replaces that markup, but not the overlay that left it: the page ends up with two overlays sharing the same `id`. Remove them once the first view is mounted:

```ts
// src/app/main.ts
import 'a11y-elements/overlays/dropdown';
import { removeOverlaysWithin } from 'a11y-elements/core';
import { AppRouter, Lifecycle, initI18n, registerPipes } from '../core/index.js';
// ... appRoutes import and App class, as generated

document.addEventListener('DOMContentLoaded', async () => {
    await initI18n();
    // The pre-rendered markup, still on the page.
    const prerendered = Array.from(document.getElementById('app')?.children ?? []);
    const stop = Lifecycle.onViewMount(() => {
        stop();
        // The first view has replaced it: remove the overlays written inside it.
        prerendered.forEach((node) => removeOverlaysWithin(node));
    });
    new App();
});
```

## Alternative: loading from a CDN

Every element also ships as a standalone, self-contained browser bundle, with no build step. Load the stylesheet and each element you use, pinned to an exact version:

```html
<!-- src/index.html -->
<head>
    <!-- ... -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/a11y-elements@0.3.0/dist/a11y.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/a11y-elements@0.3.0/dist/browser/overlays/dropdown/define.js"></script>
</head>
```

- Bundles live under `dist/browser/components/<name>/define.js` and `dist/browser/overlays/<name>/define.js`.
- `setStrings()` is exported from every `define.js`.
- The package's types aren't available to your code: declare the few element APIs you call as structural types, e.g. `type Snackbar = HTMLElement & { notify(message: string): void }`.
- Everything under [Use overlays inside components](#use-overlays-inside-components) still applies. `removeOverlaysWithin()` is exported by the `define.js` you load rather than by a package in your bundle, so the simplest is to remove the overlay you keep a reference to in the same hooks (`this.dropdown?.remove()`).
- With `generateSEOFiles`, don't load overlays from `index.html`: the pre-rendered ones would move to `<body>` before the first view replaces them. Add their `<script>` once the first view is mounted:

    ```ts
    // src/app/main.ts
    const stop = Lifecycle.onViewMount(() => {
        stop();
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://cdn.jsdelivr.net/npm/a11y-elements@0.3.0/dist/browser/overlays/dropdown/define.js';
        document.head.append(script);
    });
    new App();
    ```

*Note:* If you're using Nutin's `docker` feature, you'll have to [add the CDN source to nginx CSP map](https://nutin.org/docs/options-and-features/use-docker-feature#adding-origins-in-csp-map), for both `script-src` and `style-src`. Scope it to the version's path (`https://cdn.jsdelivr.net/npm/a11y-elements@0.3.0/`).
