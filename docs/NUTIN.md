# nutin framework

## Philosophy

nutin's core is deliberately tiny and dependency-free (`so lightweight it's
nutin`):

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
  router-only hooks `onEnter()`/`onExit()`.
- **`Component`** — reusable, non-routed UI.
  Built from a `config` object via `templateFn`, supports `data-bind` two-way
  field binding and `getValues()` to read bound fields back out.
- **`Service<T>`** — abstract singleton base. Direct `new` throws; use
  exported const `myService` (or `MyService.getInstance()`). Auto-binds all prototype methods to the
  instance, so handlers can be passed around without losing `this`.
  `registerCleanup(fn)` queues teardown run by `dispose()` (wired to
  `window.beforeunload`); `Service.destroyAll()` tears down every live
  singleton (called from `main.ts` on `beforeunload`).

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
`core/internals.d.ts`), built from `FrameworkEventMap` (navigation,
lifecycle, overlays, i18n events) plus an empty `AppEventMap` that app code
extends via declaration merging to add its own typed events.

Prefer `this.listen(event, callback)` (available on every `BaseComponent`)
over calling `AppEventBus.subscribe` directly — it auto-registers the
subscription for cleanup on `destroy()`. `this.listenToRenderEvents([...])`
is a shortcut that re-runs `this.render()` whenever any of the given events
fire.

Three facades wrap the generic bus with ergonomic named methods (each
`onXxx` returns an unsubscribe function):

- **`Lifecycle`** — `viewMount(viewName)`/`onViewMount`,
  `viewUnmount(viewName)`/`onViewUnmount` (fired by the router), plus generic
  `beforeRender`/`afterRender`/`beforeDestroy`/`afterDestroy` events (these
  are *not* auto-emitted by `BaseComponent`'s own lifecycle hooks — those call
  the protected `onBeforeRender()` etc. methods directly).
- **`Navigation`** — `navigateTo(path)`/`onNavigate`, `reload()`/`onReload`.
  The `Router` subscribes to these to drive actual navigation, so calling
  `Navigation.navigateTo('/')` from a view is the standard way to navigate.
- **`Overlays`** — `modalOpened()`/`onModalOpened`,
  `modalClosed()`/`onModalClosed`, `overlayOpened(type)`/`onOverlayOpened`,
  `overlayClosed(type)`/`onOverlayClosed`.

## Router

`AppRouter(routes)` (called once in `main.ts`) installs a singleton `Router`
against a route table:

```ts
type Routes = Record<string, (() => View) | { view: () => View; guards?: RouteGuard[] }>;
type RouteGuard = (params) => boolean | string | Promise<boolean | string>;
```

- Guards run before a route resolves: return `true` to allow, `false` to
  block, or a path string to redirect elsewhere.
- Path patterns support params (`:id`) and optional params (`:id?`);
  resolved params are available on the view via `getRouteParam(key)`.
- Navigation flow: `Navigation.navigateTo(path)` → bus `'navigate'` event →
  `Router` matches the route, runs guards, then destroys the current view
  (`view.destroy()` + `onExit()` + `Lifecycle.viewUnmount()`) and renders the
  new one (`view.setRouteParams(params)` + `view.render()` + `onEnter()` +
  `Lifecycle.viewMount()`).
- No match falls back to the `'/404'` route entry.
- Locale-prefixed URLs (`/:lang/path`) are kept in sync with `I18nService`
  automatically.

## Other core services

- **`I18nService`** — language list/default come from `config/languages.json`.
  `setCurrentLanguage(lang)` persists to `localStorage` and emits
  `'language-changed'`; `translate(key, textContent?)` does a dot-path lookup
  with fallback: current language → default language → element's existing
  text → the raw key itself. Resolution order for the active language on
  load: URL locale segment → `localStorage` → `navigator.language` →
  default. Backs the `data-i18n` attribute.
- **`HttpClient`** (`AppHttpClient`) — `get/post/put/patch/delete<T>(endpoint, data?, config?)`,
  plus `addRequestInterceptor`/`addResponseInterceptor`. Non-OK responses
  throw an `HttpError`.
- **`PipeRegistry`** (`AppPipeRegistry`) — `register(name, fn)` /
  `apply(name, value, args)`. Backs the `data-pipe` attribute; app-defined
  pipes are registered once at startup in `main.ts`.

## Public API surface

Everything is imported from `core/index.ts` — never deep-import
`core/base-classes/...` or `core/services/...`:

```ts
import {
  View, Component, Service,
  AppEventBus, Lifecycle, Navigation, Overlays,
  AppRouter, Routes, RouteGuard,
  I18nService, AppHttpClient, AppPipeRegistry,
} from '../../core/index.js';
```

## Minimal worked example

A view with a click handler that navigates home:

```ts
// not-found.view.ts
import { Navigation, View } from '../../../core/index.js';

const template = `__TEMPLATE_PLACEHOLDER__`; // inlined from not-found.view.html at build time

export class NotFoundView extends View {
  constructor() { super({ template }); }
  private handleHome() { Navigation.navigateTo('/'); }
}
```

```html
<!-- not-found.view.html -->
<button data-event="click:handleHome">Go back</button>
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
