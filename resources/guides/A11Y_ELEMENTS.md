# How to use a11y-elements?

This guide describes how to use [a11y-elements](https://nutin.dev/en/a11y-elements) in a Nutin application - bundled from npm, or loaded from a CDN - and how to use it inside Nutin components.

a11y-elements is a set of framework-agnostic accessibility Custom Elements. They are Light DOM only, and bring behavior rather than a themed UI kit: you style real markup with your own CSS.

## Install from npm

```bash
npm install a11y-elements
```

Import each element you use by its own subpath, in `src/app/main.ts`. There is no default export: `import 'a11y-elements'` alone fails.

```ts
// src/app/main.ts
import 'a11y-elements/overlays/dropdown';
import 'a11y-elements/components/spinner';
```

`import 'a11y-elements/all'` registers every element at once, but adds all of them to your bundle.

The package ships its own types. Importing an element's subpath also types exact-tag lookups, such as `document.querySelector('a11y-spinner')`.

Keep these imports in `main.ts`, not in a component or view file. Static imports run as soon as the bundle loads, wherever they are written. With `generateSEOFiles`, see also [Pre-rendered overlays](#pre-rendered-overlays).

## Load elements on demand

The builder splits every dynamic `import()` into its own chunk, which is only downloaded the first time it runs. Elements that only some pages use can be loaded from those pages' views:

```ts
// src/app/views/settings/settings.view.ts
public override onEnter(): void {
    void import('a11y-elements/overlays/modal');
}
```

- `onEnter()` never runs while SEO files are generated, so the elements are only defined in the browser.
- Each chunk is downloaded and run once, however many times `import()` is called.
- The element is defined after the view has rendered, so the overlay moves to `<body>` then, not during the render. Everything under [Use overlays inside components](#use-overlays-inside-components) works either way.
- An element used on every page (e.g. a navbar dropdown) can be loaded the same way from `main.ts`, after `new App()`. Loaded that late, it also avoids [Pre-rendered overlays](#pre-rendered-overlays): the first view has already replaced the pre-rendered markup when the element is defined.

```ts
// src/app/main.ts
document.addEventListener('DOMContentLoaded', async () => {
    await initI18n();
    new App();
    void import('a11y-elements/overlays/dropdown');
});
```

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
- Handle events by delegation on the overlay itself, not with `data-event`. This covers clicks, and also `change`/`input` from form controls inside it (e.g. an `<a11y-radio-group>` in a drawer).
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

Using AlpineJS? Moved overlays also leave its `x-data` scopes: see [With a11y-elements](https://nutin.dev/guides/alpinejs#with-a11y-elements) in the AlpineJS guide.

`removeOverlaysWithin(host)` removes every overlay written anywhere inside `host`, even once it has moved to `<body>`, including the overlays of child components. A component or view that keeps children across re-renders (`keep` or `keepBy`) would remove the overlays of those kept children too. Call it on an element around your own overlays instead:

```ts
// The view's own overlays are wrapped in <div class="home__overlays"> in its template.
private removeOwnOverlays(): void {
    const own = this.element.querySelector('.home__overlays');
    if (own) removeOverlaysWithin(own);
}
```

`<a11y-floating>` moves into a `.a11y-floating-stack` element on `<body>` (one per corner) instead. `removeOverlaysWithin()` removes it the same way, along with the stack once it's empty.

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
- **`<a11y-floating>` has no `open`**: it's visible by default. Show and hide it through the `hidden` attribute (`removeAttribute('hidden')`), for the same reason.
- **Safari and Tab.** With its default settings, Safari's Tab key skips native buttons, links, radios and checkboxes: only text fields are reached. An explicit `tabindex="0"` puts them back in the Tab order (Safari 17+). Set it on the controls you render, including the radios of an `<a11y-radio-group>`: a group with `tabindex="0"` on every radio is still a single Tab stop.

    ```html
    <button type="button" tabindex="0" data-event="click:save">Save</button>
    ```

    Inside an open dialog or drawer, the focus trap moves focus on every Tab press itself, so its own close button is reachable either way.

## Sidebar on desktop, drawer on mobile

A sidebar can become an `<a11y-drawer>` on small screens, opened by an `<a11y-floating>` button. Render the list twice from the same template: once inline, once in the drawer. CSS then shows one or the other, so nothing is moved or re-rendered on resize.

```ts
// src/app/main.ts
import 'a11y-elements/components/radio-group';
import 'a11y-elements/overlays/drawer';
import 'a11y-elements/overlays/floating';
```

```ts
// src/app/components/picker/picker.component.ts
import { removeOverlaysWithin } from 'a11y-elements/core';
import { Component, html, raw } from '../../../core/index.js';

interface PickerConfig {
    options: { value: string; label: string }[];
    selected: string;
}

// `name` differs per copy: two radio groups sharing one would uncheck each other
const renderGroup = (config: PickerConfig, copy: 'sidebar' | 'drawer') => html`
    <a11y-radio-group aria-label="Options">
        ${config.options.map((o) => html`<label>
            <input type="radio" tabindex="0" name="picker-${copy}" value="${o.value}" ${o.value === config.selected ? raw('checked') : ''}>
            ${o.label}
        </label>`)}
    </a11y-radio-group>`;

const templateFn = (config: PickerConfig) => html`
    <div class="picker__sidebar">${renderGroup(config, 'sidebar')}</div>
    <a11y-drawer id="picker-drawer" edge="left">
        <h2>Options</h2>
        ${renderGroup(config, 'drawer')}
    </a11y-drawer>
    <a11y-floating id="picker-floating" position="bottom-left" controls="picker-drawer">
        <button type="button" tabindex="0">Options</button>
    </a11y-floating>
`;

export class PickerComponent extends Component<HTMLElement, PickerConfig> {
    private drawer: HTMLElement | null = null;
    private readonly desktop = window.matchMedia('(min-width: 769px)');
    // An open drawer has no place on desktop, where the sidebar is shown
    private readonly onDesktopChange = (e: MediaQueryListEvent) => { if (e.matches) this.closeDrawer(); };

    constructor(mountTarget: HTMLElement, config: PickerConfig) {
        super({ templateFn, mountTarget, config });
        this.desktop.addEventListener('change', this.onDesktopChange);
    }

    protected override onBeforeRender(): void {
        removeOverlaysWithin(this.element);
        super.onBeforeRender();
    }

    protected override onAfterRender(): void {
        this.drawer = document.getElementById('picker-drawer');
        this.on(this.element, 'change', (e) => this.select(e));
        if (this.drawer) {
            this.on(this.drawer, 'change', (e) => this.select(e));
            this.on(this.drawer, 'click', (e) => this.closeOnPointerPick(e as MouseEvent));
        }
        super.onAfterRender();
    }

    protected override onBeforeDestroy(): void {
        this.desktop.removeEventListener('change', this.onDesktopChange);
        removeOverlaysWithin(this.element);
        super.onBeforeDestroy();
    }

    private on(target: EventTarget, type: string, listener: EventListener): void {
        target.addEventListener(type, listener);
        this.eventListeners.push([target, type, listener]);
    }

    private select(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.type !== 'radio' || !input.checked) return;
        // Keep the other copy in sync without re-rendering (a render would rebuild the drawer)
        for (const root of [this.element, this.drawer]) {
            root?.querySelectorAll<HTMLInputElement>('input[type="radio"]')
                .forEach((radio) => { radio.checked = radio.value === input.value; });
        }
        // ...apply input.value
    }

    // Arrow keys also check radios (with a click whose `detail` is 0): only close on pointer picks,
    // so keyboard users can browse options and close with Escape or ×
    private closeOnPointerPick(event: MouseEvent): void {
        if (event.detail > 0 && (event.target as HTMLElement).closest('label')) this.closeDrawer();
    }

    private closeDrawer(): void {
        this.drawer?.removeAttribute('open');
    }
}
```

```scss
// src/app/components/picker/picker.component.scss
// Same breakpoint as the matchMedia query in the component
@media (max-width: 768px) {
    .picker__sidebar { display: none; }
}

// The floating moves to <body>: target it by id, not through the component
#picker-floating {
    display: none;
    @media (max-width: 768px) { display: flex; }
}
```

- Use one id per instance (`picker-drawer-${id}`) if the component can be on the page twice, or once per view with different content.
- Both copies are in the DOM, but the hidden sidebar (`display: none`) and the closed drawer are out of the Tab order and the accessibility tree, so only one is ever reached.
- The drawer and floating live on `<body>`, outside the ancestors that carry your page's CSS variables. Give them their colors at `:root` (`--a11y-drawer-color-background`, …) or with an id selector.

## Make cards navigate with `<a11y-card-link>`

`<a11y-card-link>` makes a whole card go to the page of a real `<a href>` inside it. A click elsewhere on the card is forwarded to the link with a real `click()`, so a `data-event` on that link handles it like any other click on it:

```html
<!-- e.g. articles.component.html -->
<a11y-card-link describe>
    <div class="card">
        <h3><a href="/articles/why-nutin" data-event="click:navigateTo:@attr:href" data-i18n="articles.why-nutin"></a></h3>
        <p data-card-description data-i18n="articles.why-nutin-desc"></p>
    </div>
</a11y-card-link>
```

```ts
private navigateTo(href: string): void {
    Navigation.navigateTo(href);
}
```

- The link stays the card's only tab stop. Enter follows it, and middle-click, Cmd/Ctrl/Shift-click, "Open in new tab" and "Copy link address" work like on any link: Nutin lets modified clicks on a link through to the browser.
- Clicks on another control inside the card (a button, a second link, an input…) aren't forwarded.
- `data-i18n` is fine inside the card: `<a11y-card-link>` doesn't build markup. Just keep it off the `<a11y-card-link>` element itself.
- Use it for cards that go to another page. For cards that run an action, use a `<button>` or `<a11y-focusable>`.

## Translate built-in strings

A few English strings end up in accessible names and announcements (e.g. `Loading` on `<a11y-spinner>`, `Close dialog` on modal close buttons). Replace them with `setStrings()`, after translations are loaded and on every language change:

```ts
// src/app/main.ts
import { setStrings } from 'a11y-elements/core';
import { I18nService, initI18n } from '../core/index.js';

const applyA11yStrings = () => setStrings({
    loading: I18nService.translate('a11y.loading'),
    closeDialog: I18nService.translate('a11y.close-dialog'),
});

document.addEventListener('DOMContentLoaded', async () => {
    await initI18n();
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

Every element also ships as a browser bundle, with no build step. Load the stylesheet and each element you use, pinned to an exact version:

```html
<!-- src/index.html -->
<head>
    <!-- ... -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/a11y-elements@0.4.0/dist/a11y.css" />
    <script type="module" src="https://cdn.jsdelivr.net/npm/a11y-elements@0.4.0/dist/browser/overlays/dropdown/define.js"></script>
</head>
```

- Bundles live under `dist/browser/components/<name>/define.js` and `dist/browser/overlays/<name>/define.js`. `dist/browser/all.js` registers every element.
- They share their common code through `chunk-*.js` files in `dist/browser/`, which the CDN serves alongside them: the browser downloads it once, however many elements you load. To self-host them, copy the whole `dist/browser/` folder, not single `define.js` files.
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
        script.src = 'https://cdn.jsdelivr.net/npm/a11y-elements@0.4.0/dist/browser/overlays/dropdown/define.js';
        document.head.append(script);
    });
    new App();
    ```

*Note:* If you're using Nutin's `docker` feature, you'll have to [add the CDN source to nginx CSP map](https://nutin.dev/docs/options-and-features/use-docker-feature#adding-origins-in-csp-map), for both `script-src` and `style-src`. Scope it to the version's path (`https://cdn.jsdelivr.net/npm/a11y-elements@0.4.0/`).
