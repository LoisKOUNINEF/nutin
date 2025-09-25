# Libraries Docs

## Quick map

* `libs/snackbar/snackbar.ts` → `notify(message, options)` — simple queued snackbars/toasts
* `libs/popover/popover.ts` → `PopoverView` — small View for popovers (templated, with buttons)
* `libs/guards/guards.ts` → `Guards` — route guard helpers
* `libs/pipes/pipes.ts` → `registerPipes()` — registers a set of common pipes into `AppPipeRegistry`
* `libs/index.ts` → re-exports the modules above for easy import

You can import everything from the package root:

```ts
import { notify, PopoverView, Guards, registerPipes } from '../libs/index.ts';
```


# 1. Snackbar (notify)

**File:** `libs/snackbar/snackbar.ts`

API

```ts
type NotifyOptions = {
  type?: 'info' | 'success' | 'error';
  position?: 'top' | 'bottom';
  duration?: number; // ms
  actionText?: string;
  onAction?: () => void;
}

export function notify(message: string, options?: NotifyOptions): void
```

Behavior

* Simple queue: subsequent `notify()` calls enqueue messages; only one shows at a time.
* Each snackbar is appended to `document.body` and removed after `duration` (defaults to 3000 ms).
* If `actionText` and `onAction` are provided, an action button is rendered and wired.

Usage

```ts
import { notify } from 'libs/snackbar/snackbar.js';

notify('Saved successfully', { type: 'success', position: 'top', duration: 4000 });

// With action
notify('Failed to save', {
  type: 'error',
  actionText: 'Retry',
  onAction: () => retrySave()
});
```

Notes

* CSS classes used: `app-snackbar`, `app-snackbar--{type}`, `app-snackbar--{position}` — style these in your app (`src/styles/core/_libs.scss`).


# 2. PopoverView

**File:** `libs/popover/popover.ts`

API summary

```ts
export interface PopoverButton extends BaseButton { /* label, callback, classes, ... */ }
export interface PopoverOptions {
  template: string; // inner HTML for popover content
  viewName?: string; // default: 'popover'
  onClose?: () => void;
  buttons?: PopoverButton[]; // footer/action buttons
}

export class PopoverView extends View {
  constructor({ template, buttons = [], onClose, viewName = 'popover' }: PopoverOptions)
  render(): HTMLElement
  destroy(): void
}
```

Behavior & notes

* `PopoverView` extends the core `View` class and is intended to be used as a simple modal-like popover.
* It creates an overlay appended to `document.body` and inserts a `.popover-wrapper` element containing your `template` plus optionally rendered action buttons.
* Clicking outside the wrapper (on the overlay) will close the popover.
* Each button's callback is wrapped so the popover automatically `destroy()`s after the callback runs.
* `onClose` is called when the popover is destroyed.

Usage

```ts
import { PopoverView } from 'libs/popover/popover.js';

const pop = new PopoverView({
  template: `
    <div class="popover-body">
      <h3>Confirm</h3>
      <p>Are you sure?</p>
    </div>
  `,
  buttons: [
    { text: 'Cancel', classes: ['btn'], callback: () => console.log('cancel') },
    { text: 'Delete', classes: ['btn','btn-danger'], callback: () => doDelete() }
  ],
  onClose: () => console.log('closed')
});

pop.render();
```

Styling hooks

* The overlay element and `.popover-wrapper` should be styled in your app CSS (`src/styles/core/_libs.scss`). If `view transition` feature was enabled on app setup, the implementation adds/removes a `show` class to animate entrance/exit — match transition duration if needed.


# 3. Guards

**File:** `libs/guards/guards.ts`

Exports

```ts
export const Guards = {
  custom: (checkFn: () => boolean | string | Promise<boolean | string>, redirectTo?: string) => RouteGuard,
  // example
  requireAuth: (redirectTo: string = '/login') => RouteGuard
}
```

Behavior & usage

* Each guard returns a `RouteGuard` usable by the router (the toolkit's router expects guards that return `true` to allow navigation, or a string/redirect path to block and redirect).
* `Guards.custom` — build custom guard from a predicate function; predicate can be sync or async and may return `true` or `redirectPath`.
* `Guards.requireAuth` — simple example guard that checks `localStorage.getItem('user_token')` and redirects to `/login` by default if missing.

Example

```ts
type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;

type RouteConfig = (() => View) | {
  view: () => View;
  guards?: RouteGuard[];
};

// in routes.ts

'/protected': {
  view: () => new TaskCatalogView(),
  guards: [requireAuth]
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

* `currency` — formats numbers using `Intl.NumberFormat` (args: currency, locale)
* `date` — formats dates (implementation uses Intl.DateTimeFormat or a simple formatter)
* `number` — numeric formatting
* `uppercase`, `lowercase` — string transforms
* `capitalize`, `capitalizeAll` — capitalize first letter / all words
* `truncate` — shortens strings to a max length
* `default` — fallback value
* `json` — JSON.pretty print

Usage (in templates)

```html
<span data-pipe="currency:'EUR'">1234.5</span>
<span data-pipe="date:'short'">2024-09-01T12:00:00Z</span>
<span data-pipe="uppercase">hello</span>
```

Notes

* These pipes are registered against the toolkit's `AppPipeRegistry` so the core `data-pipe` parser will pick them up automatically when `Component`/`BaseComponent` runs pipe parsing on `render()`.
* Call `registerPipes()` during app bootstrap (before first render) to ensure pipes are available.
* Can be extended with `AppPipeRegistry.register(name: string, fn: PipeFunction)`


# 5. Re-exports

`libs/index.ts` simply re-exports the modules:

```ts
export * from './snackbar/snackbar.js';
export * from './popover/popover.js';
export * from './guards/guards.js';
export * from './pipes/pipes.js';
```

So you can import from `'libs'` (depending on your bundler/tsconfig path mappings).


# 6. Small recipes

### Show a confirmation popover and notify on action

```ts
import { PopoverView } from 'libs';
import { notify } from 'libs';

const pop = new PopoverView({
  template: '<p>Delete item?</p>',
  buttons: [
    { text: 'Cancel' },
    { text: 'OK', callback: () => notify('Deleted', { type: 'success' }) }
  ]
});
pop.render();
```

### Enable pipes at startup
Registered by default in main.ts `constructor`.

```ts
import { registerPipes } from 'libs/pipes/pipes.js';
registerPipes();
```


# 7. Where to look in code

* `src/libs/snackbar/snackbar.ts` — `notify` implementation & queue
* `src/libs/popover/popover.ts` — `PopoverView` implementation (overlay, wrapper, button wiring)
* `src/libs/guards/guards.ts` — simple guard helpers - extend as needed, or register customs.
* `src/libs/pipes/pipes.ts` — registration of app pipes - extend as needed, or register customs.
* `src/libs/index.ts` — root re-export
