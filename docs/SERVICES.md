# Services Docs

Core services (subclasses of `Service`).

## Quick map

* **[router](#1-router)** — declarative client router + navigation helpers & view render manager
* **[http-client](#2-http-client)** — lightweight fetch wrapper with interceptors and JSON helpers
* **[event-bus](#3-event-bus)** — pub/sub service for app-wide events
* **[store](#4-store)** — tied to AppEventBus. Consumable objects.
* **[i18n](#5-i18n)** — handles translations of locales JSON files
* **[pipe-registry](#6-pipe-registry)** — register & use pipes (formatters/transformers)

## 1. Router

- Exports: `Route`, `Router`. Use the Router to declare routes (navigation is handled by `AppEventBus.emit('navigate')`).

### Routes — minimal example

```ts
// src/app/routes.ts
export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/404': () => new NotFoundView(),

  // with guards (see below)
  '/protected': {
    view: () => new ProtectedView(),
    guards: [requireAuth]
  }
}
```

### Programmatic navigation (using `AppEventBus`)

```ts
AppEventBus.emit('navigate', `/tasks/${this._task.id}`);
```

## 2. HTTP (HttpClient)

Light wrapper around `fetch` with request/response interceptors and JSON handling.                                  
Has `baseUrl: string;` and `defaultHeaders: Record<string, string>;`
').then(res => console.log(res));

## 3. Event Bus

Simple pub/sub. Exposed as singleton `AppEventBus`.

```ts
// globals.d.ts
type CoreEventMap = {
  'navigate': string;
  'reload': string;
  'view-mount': string;
  'view-render': string;
  'view-unmount': string;
  'track-pageview': { page: string };

  // Add other events and their payload types here
};

type StoreEventMap = {[ K in `store:${string}` ]: any; };

// Merged event map
type EventMap = CoreEventMap & StoreEventMap;
type EventKey = keyof EventMap;
```

### Usage

```ts
import { AppEventBus } from '../libs/index.js';

AppEventBus.on('view-mount', payload => console.log(payload));
AppEventBus.emit('view-mount', { id: '42' });
AppEventBus.off('view-mount', handlerRef);
AppEventBus.subscribe('view-mount', fn())
```

## 4. Store

Can be imported with `import { AppStore } from '../core/index.js';`
```ts
set<T>(key: string, value: T);
get<T>(key: string, value: T);
subscribe<T>(key: string, callback: (value: T));
unsubscribe<T>(key: string, callback: (value: T));
clear();
```

## 5. i18n

Handles translation. Looks for `data-i18n` attributes in HTML templates and for corresponding keys in `locales` JSON files.

### Locales config file

`config/locales.json`
```json
{
  "languages": [
    "en"
  ],
  "defaultLanguage": "en"
}
```
This is consumed by i18nService, by builder and by component / view generator.

### Types

```ts
const LANGUAGES = CONFIG.langs.languages;
const DEFAULT_LANGUAGE = CONFIG.langs.defaultLanguage as (typeof LANGUAGES)[number];
type Language = typeof LANGUAGES[number];
```

### Exposed methods

- Based on browser language. If no language match browser language, defaults to DEFAULT_LANGUAGE.
- Will look for language key in components and views 'locales' 

```ts
async loadTranslations(lang: Language): Promise<void>;
translate(key: string, params?: Record<string, string>): string;
get currentLanguage(): Language;
get defaultLanguage(): Language;
get languages(): Language[];
async initTranslations(): Promise<void>;
resetTranslations(): void;
```

## 6. Pipe Registry

Register formatting/transformation functions used by the `data-pipe` system (Core consumes these).

### Register a pipe

```ts
import { AppPipeRegistry } from 'libs/pipe-registry';

AppPipeRegistry.register('currency', (value, symbol='€') => `${symbol}${Number(value).toFixed(2)}`);
AppPipeRegistry.register('uppercase', v => String(v).toUpperCase());
```

### Use in template

```html
<span data-pipe="currency:'$' | uppercase">0</span>
```

## 6. Where to look in code

* `src/core/services/`