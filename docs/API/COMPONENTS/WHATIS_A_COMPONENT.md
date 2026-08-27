# What is a component?

A component is a self-mounting, reusable UI unit. Every component extends `Component`, which extends `BaseComponent`.

Constructing a component creates and mounts its root element immediately (at `mountTarget`) — but it isn't rendered until `render()` runs, either called by hand or because a parent's `registerChildren()` mounted it as a child and rendered it.

## What a component owns

- **A render pipeline** — `onBeforeRender()` → sanitized `innerHTML` from `generateTemplate()` → mount `data-component`/`data-catalog` children → hydrate `data-i18n`/`data-pipe` attributes and drop empty `data-optional` elements → bind `data-event` listeners → `onAfterRender()`. Runs the same way on every render, not just the first. See [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md).
- **Two independent data channels** — `config` feeds `templateFn` (with `defaults`/`normalizeKeys` merging), while `props` + `data-bind` handle form-field binding. See [How do I pass data to a component?](./HOWDOI_PASS_DATA_TO_A_COMPONENT.md).
- **Child composition** — `registerChildren()` mounts nested components (`data-component`) or repeated lists (`data-catalog`), re-run on every render. See [How do I register child components?](./HOWDOI_REGISTER_CHILD_COMPONENTS.md).
- **DOM events** — `data-event="click:_handler"` attributes are bound/rebound automatically each render and torn down on `destroy()`. See [How do I handle DOM events?](./HOWDOI_HANDLE_DOM_EVENTS.md).
- **Automatic sanitization** — rendered HTML is sanitized according to `trustLevel` before it reaches the DOM. See [How do I control HTML sanitization?](./HOWDOI_CONTROL_HTML_SANITIZATION.md).
- **Self-cleanup** — `destroy()` unbinds DOM events, unsubscribes every `AppEventBus` subscription made via `this.listen(...)`, recursively destroys all tracked children, then removes the element.

## Component vs. view

`Component` and [`View`](../VIEWS_AND_ROUTING/WHATIS_A_VIEW.md) are siblings — both extend `BaseComponent`.

A component is small, reusable, and embeddable anywhere a parent component or view mounts it; it isn't tied to a route, and application code constructs it directly (`new SomeComponent(el, config)`). 

Nutin favors composing many small, focused components rather than a few large ones, orchestrated by parent components and, ultimately, a view.
