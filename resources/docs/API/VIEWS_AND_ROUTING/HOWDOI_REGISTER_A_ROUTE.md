# How do I register a route?

```ts
// src/app/routes.ts
import { HomeView } from './views/home/home.view.js';
import { AdminView } from './views/admin/admin.view.js';
import { NotFoundView } from './views/not-found/not-found.view.js';
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
type ViewFactory = () => View | Promise<View>;
type RouteConfig = ViewFactory | { view: ViewFactory; guards?: RouteGuard[] };
type Routes = Record<string, RouteConfig>;
```

- Route keys are path patterns — see [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md) for the `:id`/`:id?` syntax.
- A plain-function entry (`() => new View()`) has no guards. Use the `{ view, guards }` form when you need route guards — see [How do I use route guards?](./HOWDOI_USE_ROUTE_GUARDS.md).
- `AppRouter(routes)` installs the singleton `Router` and immediately navigates to the current path — call it exactly **once**, at app startup. Calling it again elsewhere throws, since `Router` is a `Service` singleton.

## Lazy routes

A view factory may return a Promise. Import the view's file with `import()` and the route becomes lazy: the view, and the code only it uses, go into their own chunk (`dist/src/chunks/`), downloaded the first time the route is visited instead of with the rest of the app.

```ts
// src/app/routes.ts
import { HomeView } from './views/home/home.view.js';
import { NotFoundView } from './views/not-found/not-found.view.js';

export const appRoutes: Routes = {
  '/': () => new HomeView(),
  '/reports': () => import('./views/reports/reports.view.js').then((m) => new m.ReportsView()),
  '/admin': {
    view: () => import('./views/admin/admin.view.js').then((m) => new m.AdminView()),
    guards: [Guards.requireAuth()],
  },
  '/404': () => new NotFoundView(),
};
```

- **Import the view by its own file, never through a barrel** (`views/index.ts`, `components/index.ts`). A static import anywhere in the app, even of a barrel re-exporting it, puts a file back in the main bundle. The same goes for the components a lazy view uses: import them by their file in the view, so they follow it into its chunk.
- **Keep the first page eager.** A lazy home page costs an extra request before anything renders.
- **Navigation:** guards run first, then the chunk loads. The current view stays on screen until the new one is ready. If another navigation starts meanwhile, the slower one is dropped.
- **Failed loads:** if the chunk can't be loaded (typically a deploy replaced the chunks while a tab was open, or the network dropped), the error is logged and the browser does a full page load of the target URL, which fetches the current build. If the same URL fails again within 10 seconds, it's only logged, so a broken chunk can't reload forever.
- **SEO pages:** with `generateSEOFiles`, lazy routes are prerendered like the others.
- **When it's worth it:** for views with heavy code of their own (a chart library, an editor, a big demo). A view that's mostly made of components the home page also uses saves little.

## Important: `/404` is required

A `'/404'` entry must exist in your route table. If no route matches the current path and `/404` isn't defined, the router logs `console.error('No 404 route defined')` and renders nothing — always include a not-found route.
