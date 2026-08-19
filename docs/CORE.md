# nutin framework

## Table of Contents

- [Base class hierarchy](#base-class-hierarchy)
- [Render lifecycle](#render-lifecycle)
- [`data-*` attribute conventions](#data--attribute-conventions)
- [Children / composition](#children--composition)
- [Events](#events)
- [Security](#security)
- [Router](#router)
- [Other core services](#other-core-services)
- [Public API surface](#public-api-surface)
- [Minimal worked example](#minimal-worked-example)

## Philosophy

- **No virtual DOM, no diffing.** `render()` does a full `element.innerHTML =`
  replace of a component's own subtree every time.
- **Convention over configuration via `data-*` attributes.** Instead of a
  template directive language or JSX bindings, plain HTML strings are scanned
  after each render for `data-event`, `data-i18n`, `data-pipe`,
  `data-component`, etc., and wired up imperatively.
- **Singletons for app-wide state.** Services (event bus, router, i18n, http
  client, pipe registry) are all `Service` subclasses accessed through
  `getInstance()`, never `new`.
- **Everything goes through `core/index.ts`.** App code never deep-imports
  `core/base-classes/...` or `core/services/...`.

## Base class hierarchy

```
Service<T>                    — app-wide singleton (event bus, router, i18n, http client, ...)

BaseComponent<T>               — render/hydrate/destroy engine, data-* parsing, children
├── Component                  — reusable UI piece, config/props + data-bind
└── View                       — routed page, mounted/unmounted by the Router
```

- **`View`** — one per route. Built from a template string and mounted at
  `#app` by default. Adds route params (`getRouteParams`/`getRouteParam`) and
  router-only hooks `onEnter()`/`onExit()`. Also exposes `hideNavbar()` /
  `revealNavbar()` and `hideFooter()` / `revealFooter()`, which toggle
  `display` on elements with `id="navbar"` / `id="footer"` in the page shell.
- **`Component`** — reusable, non-routed UI.
  Built from a `config` object via `templateFn`, supports `data-bind` two-way
  field binding and `getValues()` to read bound fields back out.
- **`Service<T>`** — abstract singleton base. Direct `new` throws; use
  exported const `myService` (or `MyService.getInstance()`). Auto-binds all prototype methods to the
  instance, so handlers can be passed around without losing `this`.
  `registerCleanup(fn)` queues teardown run by `dispose()` (wired to
  `window.beforeunload`); `Service.destroyAll()` tears down every live
  singleton (called from `main.ts` on `beforeunload`). Also exposes
  `Service.hasInstance(ctor)` and `Service.destroy(ctor)` (both static;
  `destroy`, like `destroyAll`, is async and awaits the instance's
  `onDestroy()`), plus `testingReset()` / `testingResetAll()` — synchronous,
  test-only helpers that drop the singleton(s) from the instance registry
  without running cleanup/`onDestroy`.

**Note on templates**: 
- components holds a `` const templateFn = (config?) => `__TEMPLATE_PLACEHOLDER__` `` string and views holds a
`` const template = `__TEMPLATE_PLACEHOLDER__` `` string. At build time,
`tools/builder` finds the sibling `.html` file and inlines its
(minified) markup in place of that placeholder — so the `.html` + `.ts` pair
becomes one self-contained component with an inline template.
- User can opt for inlined templates by setting `inlineTemplates: true` in `nutin.config.js`.


## Render lifecycle

Construction mounts the root element into the DOM immediately (default
`#app`), before `render()` is ever called. `render()`:

```
onBeforeRender()
element.innerHTML = sanitize(generateTemplate())
compose()         → addChildren()            (mount data-component/data-catalog children)
hydrate()         → parseDataAttributes()    (data-i18n, data-pipe)
                  → cleanupOptionalContent() (data-optional)
autoBindEvents()  → rebinds all data-event listeners
onAfterRender()
```

`destroy()`:

```
onBeforeDestroy()
EventHelper.destroyEvents(...)     — remove all data-event DOM listeners
AppEventBus.off(...) for every bus subscription made via listen()
ChildrenHelper.destroyChildren(...) — recursively destroy() every child
element.remove()
onAfterDestroy()
```

Overridable hooks (all no-op by default): `onBeforeRender`, `onAfterRender`,
`onBeforeDestroy`, `onAfterDestroy`, `generateTemplate()` (returns `''`),
`childConfigs()` (returns `[]`). `View` additionally exposes `onEnter()` /
`onExit()`, but these are called by the **router**, not by `render()`/
`destroy()` — they fire on navigation, not on every re-render.

## `data-*` attribute conventions

| Attribute | Purpose |
|---|---|
| `data-event="event:handler[:arg1,arg2,...]"` | Declarative DOM event delegation — binds `event` on this element to `this[handler](...)`. See [Events](#events). |
| `data-i18n="key"` | Marks an element for translation. Sets `placeholder` (inputs) or `textContent` to `I18nService.translate(key, existingText)`. |
| `data-pipe="pipeName[:args]\|pipe2..."` | Pipes the element's value/text through one or more registered pipes (chainable with `\|`), writing the result back. |
| `data-pipe-source="..."` | Optional override for the raw value fed into `data-pipe` (default: the element's own value/textContent). |
| `data-optional` | Removes the element post-render if it ends up "empty" (empty `src`, empty input value, empty/`"undefined"`/`"null"` text or attribute). |
| `data-component="selector"` | Marks a mount point for a **child** component, matched against a `ComponentConfig.selector`. See [Children](#children--composition). |
| `data-catalog="selector"` | Marks a container to be populated with a **repeated list** of children, one per item in an array. |
| `data-bind="propKey"` | `Component`-only two-way field binding: `props[propKey]` is written into the element on render, and `getValues()` reads it back. |
| `data-index` | Set automatically on catalog item wrappers (`0`, `1`, ...) for styling/lookup. |

Example:

```html
<button data-event="click:handleHome">Go back</button>
```

`data-pipe` accepts comma-separated args after a `:` and chains with `|`
(left-to-right); `data-pipe-source` overrides what value feeds the pipe:

```html
<div data-pipe="capitalizeAll"></div>
<div data-pipe="date:fr-FR,long,time"></div>
<div data-pipe="date|capitalizeAll"></div>
<div data-pipe="date:en-US,long,time|capitalizeAll"></div>
<div data-pipe="capitalizeAll" data-pipe-source="raw text to capitalize"></div>
```

### `data-optional` in detail

Two checks run on every `[data-optional]` element on each render; either one
removes it, and the attribute itself is always stripped from the element
afterward regardless:

1. The attribute's own **value** (meant for direct interpolation, e.g.
   `data-optional="${x}"`) is empty, `"undefined"`, or `"null"`.
2. A structural fallback, keyed by tag: `<img>` checks `.src`; `<input>`/
   `<textarea>` check `.value`; `<audio>`/`<video>`/`<source>` check the
   `src` attribute; anything else checks trimmed `textContent` — which is
   also treated as empty if it's literally the string `"undefined"`.

```html
<!-- Will remove div if myOptionalData is undefined -->
<div data-optional="${myOptionalData}">${myOptionalData}</div>
<div data-optional>${myOptionalData}</div>

<!-- Will remove img if its src ends up empty -->
<img data-optional src="${imageUrl}">
```

## Children / composition

A parent declares children by overriding `childConfigs()`:

```ts
public childConfigs(): ComponentConfig[] {
  return [
    { selector: 'my-child', factory: (el) => new MyChildComponent({ mountTarget: el }) },
  ];
}
```

During `render()`, every `[data-component="my-child"]` element in the
rendered template gets a `MyChildComponent` instantiated and rendered into it;
each instance is tracked in a private `_children` array. `destroy()`
recursively destroys all tracked children (which in turn tear down their own
listeners, bus subscriptions, and grandchildren) before removing the parent's
own element.

**Repeated children** use `catalogConfig()` instead of hand-writing one entry
per item — given `{ array, elementName, selector, component }` it clears a
`[data-catalog="selector"]` container, generates one wrapper (with
`data-index`) and `data-component="elementName-i"` per array item, and
returns the matching `ComponentConfig[]`, which then flows through the exact
same child-mounting path. Include it inside `childConfigs()`:

```ts
childConfigs() {
  return [...this.catalogConfig({ array: this.items, elementName: 'item', selector: 'items', component: (el, item) => new ItemComponent({ mountTarget: el }) })];
}
```

Every generated catalog item config carries an `index`. For object array items,
the item is spread directly and `index` is merged in; primitive array items
(string, number, ...) can't be spread, so they're wrapped as
`{ value: item, index }` instead — use `config.value` to read the raw
primitive back out.

Top-level, non-routed components (e.g. a navbar/footer) are typically
mounted directly against `document.body` in `main.ts`, outside the router's
view tree entirely.

## Events

**DOM delegation** (`data-event`): `element.querySelectorAll('[data-event]')`
is scanned on every render; each `"event:handler:arg1,arg2"` attribute binds
`event` to `this[handler](...resolvedArgs)`. Args are resolved per-token via
`TokenHelper.resolve`:

- Exact tokens: `@id`, `@class`, `@name`, `@tag`, `@value`, `@checked`,
  `@selected`, `@textContent`, `@innerText`, `@html`, `@event`, `@target`,
  `@x`, `@y`, `@key`, `@code`.
- Prefixed tokens: `@attr:name` (reads any HTML attribute), `@dataset:key`
  (reads `data-key`).
- String (`"..."`/`'...'`) and number literals.
- Anything else is registered via `TokenHelper.registerCustomToken`/
  `registerPrefixedToken`, or falls back to the raw token text.

Note: resolving any arg calls `event.preventDefault()` unconditionally.
Listeners are re-bound (old ones torn down first) on every render, and fully
removed on `destroy()`.

**Internal event bus** (`AppEventBus`, a `Service` singleton):

```ts
AppEventBus.subscribe(event, callback)
AppEventBus.once(event, callback)
AppEventBus.emit(event, data?)
AppEventBus.off(event, callback?)   // omit callback to remove all handlers for that event
```

Event names/payloads are typed via a global `EventMap` (declared in
`core/internals.d.ts`), built from `FrameworkEventMap` plus an empty
`AppEventMap` that app code extends via declaration merging to add its own
typed events:

```ts
interface NavigationEventMap {
  'navigate': { path: string };
  'reload': {};
}
interface LifecycleEventMap {
  'before-render': {};
  'after-render': {};
  'before-destroy': {};
  'after-destroy': {};
  'view-mount': { viewName: string };
  'view-unmount': { viewName: string };
}
interface I18nEventMap {
  'language-changed': { lang: string };
}
interface FrameworkEventMap extends NavigationEventMap, LifecycleEventMap, I18nEventMap {}
interface AppEventMap {} // your app's own events go here (globals.d.ts)
interface EventMap extends FrameworkEventMap, AppEventMap {}
```

Prefer `this.listen(event, callback)` (available on every `BaseComponent`)
over calling `AppEventBus.subscribe` directly — it auto-registers the
subscription for cleanup on `destroy()`. `this.listenToRenderEvents([...])`
is a shortcut that re-runs `this.render()` whenever any of the given events
fire.

Two facades wrap the generic bus with ergonomic named methods (each
`onXxx` returns an unsubscribe function):

- **`Lifecycle`** — `viewMount(viewName)`/`onViewMount`,
  `viewUnmount(viewName)`/`onViewUnmount` (fired by the router), plus generic
  `beforeRender`/`afterRender`/`beforeDestroy`/`afterDestroy` events (these
  are *not* auto-emitted by `BaseComponent`'s own lifecycle hooks — those call
  the protected `onBeforeRender()` etc. methods directly).
- **`Navigation`** — `navigateTo(path)`/`onNavigate`, `reload()`/`onReload`.
  The `Router` subscribes to these to drive actual navigation, so calling
  `Navigation.navigateTo('/')` from a component or a view is the standard way to navigate.

### Custom tokens

`TokenHelper` isn't re-exported from `core/index` (it's an internal
implementation detail) — import it via its real relative path if needed:

```ts
import { TokenHelper } from '../../../core/base-classes/base-component/helpers/token.helper.js';
```

- `TokenHelper.registerCustomToken('@timestamp', () => Date.now())` — for a
  fixed token with no variable part.
- `TokenHelper.registerPrefixedToken('@style:', (prop, el) => el.style[prop] ?? '')`
  — for a repeatable pattern with a dynamic suffix (`@style:color`, ...).
  Prefixed tokens resolve fine when called directly
  (`TokenHelper.resolve('@style:color', el, event)`), but not as a
  `data-event` argument — `data-event`'s value is split naively on `:`, so a
  prefixed token used there has its suffix swallowed.

## Security

`SecurityHelper.sanitizeTemplate(template, trustLevel)` runs on every
`render()`, before the template is assigned to `innerHTML`. `trustLevel`
(`'strict' | 'normal' | 'trusted'`, default `'normal'`) can be set per
component via its `super()`:

- `trusted` — no sanitization at all.
- `normal` — strips `<script>` tags and inline `on*="..."` handler
  attributes.
- `strict` — everything `normal` does, plus strips `<iframe>`, `<object>`,
  `<embed>` tags, `href="javascript:..."`, and `src="data:..."`.

`SecurityHelper.escapeHtml()` is available for manually escaping arbitrary
strings before inserting them into `innerHTML` or an attribute. Most exact
`data-event` tokens (`@id`, `@class`, `@textContent`, ...) are escaped via
plain `escapeHtml`; `@value` specifically routes through a variant that's
aware of `input`/`textarea`/`contenteditable` elements, escaping their
current value/`innerText`.

XSS test cases worth trying against `strict`/`normal` sanitization:

```
"><script>alert('XSS')</script>
"><img src=x onerror=alert('XSS')>
"><svg onload=alert('XSS')>
${alert('XSS')}                      (template literal escape, if using backticks)
" onmouseover="alert('XSS')"
```

## Router

`AppRouter(routes)` (called once in `main.ts`) installs a singleton `Router`
against a route table:

```ts
type Routes = Record<string, (() => View) | { view: () => View; guards?: RouteGuard[] }>;
type RouteGuard = (params) => boolean | string | Promise<boolean | string>;
```

- Guards run before a route resolves: return `true` to allow, `false` to
  block, or a path string to redirect elsewhere. Guards you write are
  scaffolded starter code in `src/app/guards.ts` (e.g. an example
  `Guards.requireAuth(redirectTo?)` checking `localStorage`) — not a
  framework `core` export, edit it freely.
- Path patterns support params (`:id`) and optional params (`:id?`);
  resolved params are available on the view via `getRouteParam(key)`.

```ts
// src/app/routes.ts
export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/404': () => new NotFoundView(),
  '/protected': { view: () => new ProtectedView(), guards: [Guards.requireAuth()] },
};

// main.ts
AppRouter(appRoutes);
```

- Navigation flow: `Navigation.navigateTo(path)` → bus `'navigate'` event →
  `Router` matches the route, runs guards, then destroys the current view
  (`view.destroy()` + `onExit()` + `Lifecycle.viewUnmount()`) and renders the
  new one (`view.setRouteParams(params)` + `view.render()` + `onEnter()` +
  `Lifecycle.viewMount()`).
- No match falls back to the `'/404'` route entry.
- Locale-prefixed URLs (`/:lang/path`) are kept in sync with `I18nService`
  automatically.

## Other core services

- **`I18nService`** — language list/default come from `config/languages.json`
  (`{ "languages": [...], "defaultLanguage": "..." }`). Full method/getter
  surface: `loadTranslations(lang)`, `translate(key, textContent?)`,
  `setCurrentLanguage(lang)`, `onLanguageChange(cb)`, `getTranslationObject(key)`,
  `initTranslations()`, `resetTranslations()`, and getters `currentLanguage`,
  `defaultLanguage`, `languages`, `localStorageKey` (`'nutin-fav-lang'`).
  `setCurrentLanguage(lang)` persists to `localStorage` and emits
  `'language-changed'`; `translate(key, textContent?)` does a dot-path lookup
  with fallback: current language → default language → element's existing
  text → the raw key itself. Resolution order for the active language on
  load: URL locale segment → `localStorage` → `navigator.language` →
  default. Backs the `data-i18n` attribute.
- **`HttpClient`** (`AppHttpClient`) — constructed with
  `(baseUrl = '', defaultHeaders = {})` (both private, no public getters):

  ```ts
  get<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T>;
  post<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
  put<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
  patch<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
  delete<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T>;
  addRequestInterceptor(fn: (url: string, options: RequestInit) => void): void;
  addResponseInterceptor(fn: (response: Response) => void): void;

  interface IRequestConfig {
    queryParams?: Record<string, string>;
    timeout?: number;
    headers?: Record<string, string>;
  }
  ```

  Non-OK responses throw an `HttpError`.
- **`PipeRegistry`** (`AppPipeRegistry`) — `register(name, fn)` /
  `apply(name, value, args)`. Backs the `data-pipe` attribute; app-defined
  pipes are registered once at startup in `main.ts`. Applying an unregistered
  pipe name logs a `console.warn` and passes the value through unchanged; `register()` logs a `console.warn` if that name is already taken.

## Public API surface

Everything is imported from `core/index.ts` — never deep-import
`core/base-classes/...` or `core/services/...`:

```ts
import {
  View, Component, Service,
  SecurityHelper, TrustLevel,
  AppEventBus, Lifecycle, Navigation,
  AppRouter, Routes, RouteGuard,
  I18nService, AppHttpClient, AppPipeRegistry,
} from '../../core/index.js';
```

A handful of internal helpers (`TokenHelper`, `PipeHelper`, `I18nHelper`,
`ChildrenHelper`, `EventHelper`, `DomHelper`, and the `CatalogHelper` class
itself — as opposed to its `CatalogConfig`/`CatalogItemConfig` types, which
are exported) aren't re-exported from `core/index`. They're importable only
via their real relative path under
`core/base-classes/base-component/helpers/`, as shown in
[Custom tokens](#custom-tokens) above.

## Minimal worked example

A component with a click handler:

```ts
// add-task.component.ts
import { Component, ComponentConfig } from '../../../core/index.js';
import { TasksService } from '../../services/index.js';

const templateFn = () => `
<div>
  <button data-event="click:_addTask">New Task</button>
</div>
`;

export class AddTaskComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({ templateFn, mountTarget });
  }

  private _addTask() {
    TasksService.addTask();
  }
}
```

A view with a click handler that navigates home:

```ts
// not-found.view.ts
import { Navigation, View } from '../../../core/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`; // inlined from not-found.view.html at build time

export class NotFoundView extends View {
  constructor() { super({ template }); }
  private _handleHome() { Navigation.navigateTo('/'); }
}
```

```html
<!-- not-found.view.html -->
<button data-event="click:_handleHome">Go back</button>
```

A minimal singleton service:

```ts
// example.service.ts
import { Service } from '../../../core/index.js';

export class ExampleService extends Service<ExampleService> {
  constructor() {
    super();
    this.registerCallback();
  }
  protected registerCallback(): void { /* register cleanup callbacks here */ }
  protected onDestroy(): void { this.dispose(); }
}

export const exampleService = ExampleService.getInstance();
```
