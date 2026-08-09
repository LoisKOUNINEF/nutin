# Libraries Docs

## Quick map

Base `libs/` ships one thing unconditionally: **pipes**. Everything else in this doc is only present when its feature flag is enabled at `nutin-new`/`nutin-add <feature>` time — `libs/index.ts` conditionally re-exports each feature's barrel:

```ts
// libs/index.ts.hbs (simplified)
export * from './pipes/pipes.js';
// only if `overlays` feature is on:
export * from './overlays/index.js';
// only if `accessibilityComponents` feature is on:
export * from './accessibility-components/index.js';
// only if `forms` feature is on:
export * from './forms/index.js';
```

* `libs/pipes/pipes.ts` → `registerPipes()` — always present, registers a set of common pipes into `AppPipeRegistry`
* `libs/overlays/passive/snackbar.ts` → `notify(message, options)` — **requires the `overlays` feature**
* `libs/overlays/popover/popover.ts` → `PopoverOverlay` — **requires the `overlays` feature**
* `src/app/guards.ts` → `Guards` — app-level (not part of `libs/`), always present
* `libs/index.ts` → barrel file re-exporting whatever's enabled
```ts
import { registerPipes } from '../libs/index.js';
// only available if `overlays` is enabled:
import { notify, PopoverOverlay } from '../libs/index.js';
```

## 1. Snackbar (notify)

**File:** `libs/overlays/passive/snackbar.ts` (only present with the `overlays` feature)

API

```ts
type NotifyOptions = {
  type?: 'info' | 'success' | 'error';
  position?: 'top' | 'bottom';
  duration?: number; // ms, default 3000
  actionText?: string; // button content
  onAction?: () => void; // callback
  maxStack?: number; // caps how many snackbars can be stacked at once
}

export function notify(message: string, options?: NotifyOptions): void
```

Behavior

* `notify` is backed by a `PassiveOverlayRuntime`-based queue with separate top/bottom containers (both rendered at once; each snackbar appends to whichever container matches its `position`).
* Each snackbar is auto-dismissed after `duration` (defaults to 3000 ms), or immediately when its action button is clicked.
* If `actionText` and `onAction` are provided, an action button is rendered and wired; clicking it calls `onAction` then dismisses.
* Accessibility: each snackbar sets `role="alert"`/`aria-live="assertive"` for `type: 'error'`, otherwise `role="status"`/`aria-live="polite"`, plus `aria-atomic="true"`.

Usage

```ts
import { notify } from 'libs/index.js';

notify('Saved successfully', { type: 'success', position: 'top', duration: 4000 });

// With action
notify('Failed to save', {
  type: 'error',
  actionText: 'Retry',
  onAction: () => retrySave()
});
```

Notes

* CSS classes used: `app-snackbar`, `app-snackbar--{type}` (`info`/`success`/`error`). There is no position modifier class — position is expressed by which container (`.snackbar-region__bottom` / `.snackbar-region__top`) the snackbar is appended to.
* Styles are co-located at `libs/overlays/passive/_snackbar.scss`, forwarded via `libs/overlays/_index.scss` → `libs/_index.scss`.

# 2. PopoverOverlay

**File:** `libs/overlays/popover/popover.ts` (only present with the `overlays` feature)

API summary

```ts
export interface PopoverOptions extends AnchoredOverlayRuntimeOptions {
  anchor: HTMLElement;         // required — element the popover is positioned against
  template: string;            // inner HTML for popover content
  components?: ComponentConfig[];
  catalogs?: CatalogConfig[];
  interactive?: boolean;       // default false — sets role="dialog" + defaults trapFocus on
  onClose?: () => void;
}

// inherited from AnchoredOverlayRuntimeOptions
export interface AnchoredOverlayRuntimeOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right' | `${'top'|'bottom'|'left'|'right'}-${'start'|'end'}`; // default 'bottom'
  offset?: number;        // default 8
  trapFocus?: boolean;    // default false (or `interactive` if set)
  focusTrapOptions?: IFocusTrapOptions;
  animationDuration?: number;
}

export class PopoverOverlay extends AnchoredOverlayRuntime {
  constructor(options: PopoverOptions)
  open(): HTMLElement
  close(): void
}
```

Behavior & notes

* `PopoverOverlay` extends `AnchoredOverlayRuntime`, which handles anchor-relative positioning (with auto-flip), outside-click dismissal, `Escape` key handling, optional focus trapping, and reposition-on-resize/scroll.
* `template` plus any `components`/`catalogs` are rendered inside a `.popover-wrapper` element; `role` is `"dialog"` when `interactive: true`, `"region"` otherwise.
* Call `.open()` to render/position/show it, `.close()` to dismiss (also triggered by outside click / `Escape`).
* `onClose` is called right before the popover is destroyed.
* There is no `buttons`/footer-actions option — compose action buttons via `template`/`components` and wire them with `data-event` in the usual way.

Usage

```ts
import { PopoverOverlay } from 'libs/index.js';

const pop = new PopoverOverlay({
  anchor: triggerButtonEl,
  template: `
    <div class="popover-body">
      <h3>Confirm</h3>
      <p>Are you sure?</p>
      <button data-event="click:onCancel">Cancel</button>
      <button data-event="click:onDelete">Delete</button>
    </div>
  `,
  interactive: true,
  onClose: () => console.log('closed')
});

pop.open();
```

Styling hooks

* Styles are co-located at `libs/overlays/popover/_popover.scss`, forwarded via `libs/overlays/_index.scss` → `libs/_index.scss`.

# 3. Guards

**File:** `src/app/guards.ts` (app-level file, not part of `libs/`)

Exports

```ts
export const Guards = {
  requireAuth: (redirectTo: string = '/login') => RouteGuard
}
```

Behavior & usage

* `requireAuth` is a minimal example guard: checks `localStorage.getItem('user_token')` and redirects to `/login` by default if missing.
* Extend this file with your own guards as needed — write a plain function matching the `RouteGuard` signature and add it to (or alongside) the `Guards` object.

Example

```ts
type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;

type RouteConfig = (() => View) | {
  view: () => View;
  guards?: RouteGuard[];
};

// in routes.ts

'/protected': {
  view: () => new ProtectedView(),
  guards: [Guards.requireAuth()]
}
```

# 4. Pipes registration

**File:** `libs/pipes/pipes.ts`
```ts
type PipeFunction = (value: any, ...args: any[]) => string;
```

API

```ts
import { registerPipes } from '../libs/pipes/pipes.js';
registerPipes(); // registers a set of utility pipes into AppPipeRegistry
```

What it registers (summary)

* `currency` — `(value, currency = 'USD', locale = 'en-US')`, formats via `Intl.NumberFormat`
* `date` — `(value, locale = navigator.language, format = 'long' | 'short' | 'time', time = false)`, formats via `Intl.DateTimeFormat`. Note: the first argument is the **locale**, not the format — e.g. `date:en-US,short` for short format, not `date:'short'`.
* `number` — `(value, decimals = 0)`, numeric formatting via `.toFixed()`
* `uppercase`, `lowercase` — string transforms
* `capitalize`, `capitalizeAll` — capitalize first letter / all words
* `truncate` — `(value, length = 50, suffix = '...')`
* `default` — `(value, defaultValue = '')` fallback value
* `json` — JSON.pretty print

Usage (in templates)

```html
<span data-pipe="currency:EUR">1234.5</span>
<span data-pipe="date:en-US,short">2024-09-01T12:00:00Z</span>
<span data-pipe="uppercase">hello</span>
```

Notes

* These pipes are registered against the toolkit's `AppPipeRegistry` so the core `data-pipe` parser will pick them up automatically when `Component`/`BaseComponent` runs pipe parsing on `render()`.
* Call `registerPipes()` during app bootstrap (before first render) to ensure pipes are available.
* Can be extended with `AppPipeRegistry.register(name: string, fn: PipeFunction)`

# 5. Centralized exports (barrel file)

`libs/index.ts` 

# 6. Small recipes

### Show a confirmation popover and notify on action

```ts
import { PopoverOverlay, notify } from 'libs/index.js';

const pop = new PopoverOverlay({
  anchor: triggerButtonEl,
  template: `
    <p>Confirm?</p>
    <button data-event="click:onCancel">Cancel</button>
    <button data-event="click:onOk">OK</button>
  `,
});
pop.open();
// wire onOk to call notify('Confirmed', { type: 'success' }) then pop.close()
```

### Enable pipes at startup
Registered by default in main.ts `constructor`.

```ts
import { registerPipes } from 'libs/pipes/pipes.js';
registerPipes();
```

# 7. Where to look in code

* `src/libs/pipes/pipes.ts` — registration of app pipes - extend as needed, or register customs.
* `src/libs/overlays/passive/snackbar.ts` — `notify` implementation & queue *(overlays feature)*
* `src/libs/overlays/popover/popover.ts` — `PopoverOverlay` implementation (anchoring, focus trap, dismissal) *(overlays feature)*
* `src/libs/overlays/core/` — shared `OverlayRuntime`/`AnchoredOverlayRuntime`/`PassiveOverlayRuntime` base classes *(overlays feature)*
* `src/app/guards.ts` — guard helpers - extend as needed
* `src/libs/index.ts` — barrel file
