# How do I mock core services?

For services that shouldn't hit real state (event bus, HTTP, i18n, router),
`testin-nutin/mocks/` provides plain classes built from a shared factory,
`createMockMethod()`:

```js
fn.calls                        // recorded argument arrays
fn.mockReturnValue(value)       // always return value
fn.mockImplementation(implFn)   // delegate to implFn
fn.mockReset()                  // clear calls + both overrides
```

Each mock mirrors its real service's public API, and most of its methods have a
working default implementation (e.g. `MockEventBus` really dispatches), which
`mockReset()` keeps. `MockHttpClient`'s methods are bare: unconfigured, they
return `undefined`.

There's no auto-mocking or DI container. `MockEventBus` can be installed
globally: `useEventBus(mock)` (from `core/index.js`) routes every
`subscribe`/`once`/`emit`/`off` made through `AppEventBus` to it, which covers
components' `listen()`, the `Navigation`/`Lifecycle` facades, the router, i18n
and your own services. `useEventBus(null)` restores the real bus. A
subscription stays on the bus it was made on, so install the mock before
mounting or initializing, and restore the real bus after destroying:

```js
import { useEventBus } from '#root/dist/src/core/index.js';
import { MockEventBus } from '#root/tools/testin-nutin/mocks/mock-event-bus.js';

describe('CartComponent', () => {
  let bus;

  beforeEach(() => {
    bus = new MockEventBus();
    useEventBus(bus);
  });

  afterEach(() => {
    useEventBus(null);
  });

  it('subscribes to cart updates and unsubscribes on destroy', () => {
    const cart = new CartComponent({});
    expect(bus.handlers['cart-updated'].length).toBe(1);
    cart.destroy();
    expect(bus.handlers['cart-updated'].length).toBe(0);
  });
});
```

The other mocks are substituted by hand, through constructor injection where
a class takes its dependency as a constructor param.

| Mock | File | Mocks (see NUTIN.md) | Notable methods |
|---|---|---|---|
| `MockEventBus` | `mocks/mock-event-bus.js` | `AppEventBus` | `subscribe`/`once`/`emit`/`off` form a real in-memory pub/sub; `onDestroy`; `reset()` |
| `MockHttpClient` | `mocks/mock-http-client.js` | `AppHttpClient` | `get`/`post`/`put`/`patch`/`delete`, `addRequestInterceptor`/`addResponseInterceptor`, `onDestroy`, all bare mocks; `reset()` |
| `MockI18n` | `mocks/mock-i18n.js` | `I18nService` | working `translate`/`getTranslationObject` lookup, `loadTranslations`, `setCurrentLanguage`, `onLanguageChange` (returns an unsubscribe function), `initTranslations`, `resetTranslations`; `currentLanguage`/`defaultLanguage`/`languages`/`localStorageKey` getters; `setTranslations()`/`setDefaultTranslations()` to seed state directly; `reset()` |
| `MockRouter` | `mocks/mock-router.js` | `Router`/`AppRouter` | `navigate`, `reload`, `getCurrentParams`, `getParam`, `removeEventListeners`, `onDestroy`; `setParams()` to seed params; `reset()` |

The shared spy factory itself lives at `mocks/create-mock-method.js`.

See [How do I use test coverage?](./HOWDOI_USE_TEST_COVERAGE.md).
