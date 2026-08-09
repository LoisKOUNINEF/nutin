# Services Docs

Core services (subclasses of `Service`).

## Quick map

* **[router](#1-router)** — declarative client router + navigation helpers & view render manager
* **[http-client](#2-http-client)** — lightweight fetch wrapper with interceptors and JSON helpers
* **[event-bus](#3-event-bus)** — pub/sub service for app-wide events, plus typed facades
* **[i18n](#4-i18n)** — handles translations of locales JSON files
* **[pipe-registry](#5-pipe-registry)** — register & use pipes (formatters/transformers)

## 1. Router

- Exports: `Routes` (type), `RouteGuard` (type), `RouteConfig` (type), `Router`/`AppRouter`. `AppRouter(routes)` is the singleton factory — call it once with your route map to get the router instance. Navigation is handled via the `Navigation` facade over `AppEventBus`.

### Routes — minimal example

```ts
// src/app/routes.ts
export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/404': () => new NotFoundView(),

  // with guards (see below)
  '/protected': {
    view: () => new ProtectedView(),
    guards: [Guards.requireAuth()]
  }
}

// bootstrapping the router (e.g. in main.ts)
AppRouter(appRoutes);
```

### Programmatic navigation (using the `Navigation` facade)

```ts
import { Navigation } from '../core/index.js';

Navigation.navigateTo(`/tasks/${this._task.id}`);
```

`Navigation` wraps `AppEventBus`'s `'navigate'` event (payload `{ path: string }`) — prefer it over emitting on the bus directly. It also exposes `onNavigate(cb)`, `reload()`, and `onReload(cb)`.

## 2. HTTP (HttpClient)

Light wrapper around `fetch` with request/response interceptors and JSON handling, exposed as the singleton `AppHttpClient`.

```ts
class HttpClient extends Service<HttpClient> {
  get<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T>;
  post<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
  put<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
  patch<T = unknown>(endpoint: string, data?: unknown, config?: IRequestConfig): Promise<T>;
  delete<T = unknown>(endpoint: string, config?: IRequestConfig): Promise<T>;

  addRequestInterceptor(fn: (url: string, options: RequestInit) => void): void;
  addResponseInterceptor(fn: (response: Response) => void): void;
}

interface IRequestConfig {
  queryParams?: Record<string, string>;
  timeout?: number;
  headers?: Record<string, string>;
}
```

* Constructed with `(baseUrl = '', defaultHeaders = {})` — `baseUrl`/`defaultHeaders` are private, no public getters.
* Non-OK responses throw `HttpError` (an `Error` subclass) — wrap calls in `try/catch` or let it propagate.

### Usage

```ts
import { AppHttpClient } from '../core/index.js';

AppHttpClient.get('/api/tasks').then(res => console.log(res));
AppHttpClient.addRequestInterceptor((url, options) => console.log('→', url));
```

## 3. Event Bus

Simple pub/sub. Exposed as singleton `AppEventBus`.

```ts
class EventBus {
  subscribe<K extends EventKey>(event: K, callback: (data: EventMap[K]) => void): void;
  once<K extends EventKey>(event: K, callback: (data: EventMap[K]) => void): void;
  emit<K extends EventKey>(event: K, data?: EventMap[K]): void;
  off<K extends EventKey>(event: K, callback?: (data: EventMap[K]) => void): void; // omit callback to remove all handlers for that event
}
```

### Event map

The framework's built-in events are split by concern and merged with your app's own events (declared in `globals.d.ts`'s `AppEventMap`), in `core/internals.d.ts`:

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

interface OverlaysEventMap {
  'modal-opened': {};
  'modal-closed': {};
  'overlay-opened': { type: string };
  'overlay-closed': { type: string };
}

interface I18nEventMap {
  'language-changed': { lang: string };
}

interface FrameworkEventMap extends NavigationEventMap, LifecycleEventMap, OverlaysEventMap, I18nEventMap {}
interface AppEventMap {} // your app's own events go here (globals.d.ts)
interface EventMap extends FrameworkEventMap, AppEventMap {}
type EventKey = keyof EventMap;
```

### Usage

```ts
import { AppEventBus } from '../core/index.js';

AppEventBus.subscribe('view-mount', payload => console.log(payload.viewName));
AppEventBus.emit('view-mount', { viewName: 'home' });
AppEventBus.off('view-mount', handlerRef);
```

### Facades

Rather than emitting/subscribing on the raw bus, three typed facades wrap the framework event groups above and are the recommended way to use them:

```ts
import { Navigation, Lifecycle, Overlays } from '../core/index.js';

Navigation.navigateTo('/tasks');
Navigation.onNavigate(({ path }) => console.log(path));
Navigation.reload();
Navigation.onReload(() => console.log('reloading'));

Lifecycle.viewMount('home');
Lifecycle.onViewMount(({ viewName }) => console.log(viewName));
// same pattern for onViewUnmount, beforeRender/onBeforeRender, afterRender/onAfterRender, beforeDestroy/onBeforeDestroy, afterDestroy/onAfterDestroy

Overlays.modalOpened();
Overlays.onModalOpened(() => console.log('modal opened'));
// same pattern for modalClosed, overlayOpened(type)/onOverlayOpened, overlayClosed(type)/onOverlayClosed
```

Each `on*` method returns an unsubscribe function.

## 4. i18n

Handles translation. Looks for `data-i18n` attributes in HTML templates and for corresponding keys in `locales` JSON files. Exposed as singleton `I18nService`.

### Locales config file

`config/languages.json`
```json
{
  "languages": [
    "en"
  ],
  "defaultLanguage": "en"
}
```
This is consumed by `I18nService`, by the builder, and by the component/view generator.

### Types

```ts
const LANGUAGES = CONFIG.langs.languages;
const DEFAULT_LANGUAGE = CONFIG.langs.defaultLanguage as (typeof LANGUAGES)[number];
type Language = typeof LANGUAGES[number];
```

### Exposed methods

```ts
async loadTranslations(lang: Language): Promise<void>;
translate(key: string, textContent?: string | null): string;
async setCurrentLanguage(lang: Language): Promise<void>;
onLanguageChange(callback: (payload: { lang: string }) => void): void;
getTranslationObject<T = any>(key: string): T | null;
get currentLanguage(): Language;
get defaultLanguage(): Language;
get languages(): Language[];
get localStorageKey(): string; // 'nutin-fav-lang'
async initTranslations(): Promise<void>;
resetTranslations(): void;
```

* `translate(key, textContent?)` — `textContent` is a **fallback string** (typically the element's existing text), not an interpolation/params object; there is no `{placeholder}`-style variable interpolation. Resolution order: current-language translations → default-language translations → the passed-in `textContent` fallback → the raw key itself.
* Preferred-language resolution (`getPreferredLanguage`, used on init and whenever `initTranslations()`/`setCurrentLanguage()` runs): URL locale segment (if i18n-aware routing is on) → persisted `localStorage` preference (`nutin-fav-lang`) → `navigator.language` → `defaultLanguage`.
* `setCurrentLanguage(lang)` persists the choice to localStorage, reloads translations, and emits `'language-changed'` — prefer this over calling `loadTranslations` directly when the user is switching languages.

## 5. Pipe Registry

Register formatting/transformation functions used by the `data-pipe` system. Exposed as singleton `AppPipeRegistry`, imported from `core/index.js` (not from `libs/`).

### Register a pipe

```ts
import { AppPipeRegistry } from '../core/index.js';

AppPipeRegistry.register('currency', (value, symbol='€') => `${symbol}${Number(value).toFixed(2)}`);
AppPipeRegistry.register('uppercase', v => String(v).toUpperCase());
```

`register(name, fn)` silently no-ops (with a console warning) if a pipe with that name is already registered.

### Use in template

```html
<span data-pipe="currency:'$' | uppercase">0</span>
```

Internally, the `data-pipe` parser calls `AppPipeRegistry.apply(name, value, args)`, which looks up the pipe and invokes it — applying an unregistered pipe name warns and returns the raw value unchanged.

## 6. Where to look in code

* `src/core/services/`
