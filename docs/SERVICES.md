# Services Docs

Core services (subclasses of `Service`).

## Quick map

* **[router](#1-router)** — declarative client router + navigation helpers
* **[http-client](#2-http-client)** — lightweight fetch wrapper with interceptors and JSON helpers
* **[event-bus](#3-event-bus)** — pub/sub service for app-wide events
* **[store](#4-store)** — tied to AppEventBus. Consumable objects.
* **[pipe-registry](#5-pipe-registry)** — register & use pipes (formatters/transformers)


## 1. Router

- **IMPORTANT : Routes' URL MUST match view's `viewName`.**                        
- Exports: `Route`, `AppRouter` (singleton). Use the Router to declare routes (navigation is handled by `AppEventBus.emit('navigate')`).

### Routes — minimal example

```ts
import { Router } from 'libs/router';

const routes = [
  { path: '/', component: HomeView },
  { path: '/users/:id', component: UserView },
];

const router = new Router({ routes, mountPoint: '#app' });
router.start();
```


### Programmatic navigation (using `AppEventBus`)

```ts
AppEventBus.emit('navigate', `/tasks/${this._task.id}`);
```


## 2. HTTP (HttpClient)

Light wrapper around `fetch` with request/response interceptors and JSON handling.                                  
Has `baseUrl: string;` and `defaultHeaders: Record<string, string>;`

### Basic usage

```ts
import { HttpClient } from 'libs/http';

const api = new HttpClient({ baseUrl: '/api' });
api.get('/users').then(res => console.log(res));
```


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


## 5. Pipe Registry

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