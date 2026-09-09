# How do I register a route?

```ts
// src/app/routes.ts
import { Routes } from '../core/index.js';
import { HomeView, AdminView, NotFoundView } from './views/index.js';
import { Guards } from './guards.js';

export const appRoutes: Routes = {
  '/': () => new HomeView(),                                          // plain-function form
  '/admin': { view: () => new AdminView(), guards: [Guards.requireAuth()] }, // guarded form
  '/404': () => new NotFoundView(),                                   // required — see below
};
```

```ts
// main.ts
import { AppRouter } from '../core/index.js';
import { appRoutes } from './routes.js';

AppRouter(appRoutes);
```

```ts
type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;
type RouteConfig = (() => View) | { view: () => View; guards?: RouteGuard[] };
type Routes = Record<string, RouteConfig>;
```

- Route keys are path patterns — see [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md) for the `:id`/`:id?` syntax.
- A plain-function entry (`() => new View()`) has no guards. Use the `{ view, guards }` form when you need route guards — see [How do I use route guards?](./HOWDOI_USE_ROUTE_GUARDS.md).
- `AppRouter(routes)` installs the singleton `Router` and immediately navigates to the current path — call it exactly **once**, at app startup. Calling it again elsewhere throws, since `Router` is a `Service` singleton.

## Gotcha: `/404` is required

A `'/404'` entry must exist in your route table. If no route matches the current path and `/404` isn't defined, the router logs `console.error('No 404 route defined')` and renders nothing — always include a not-found route.
