# How do I register a route?

```ts
// src/app/routes.ts
import { HomeView } from './views/home/home.view.js';
import { AdminView } from './views/admin/admin.view.js';
import { NotFoundView } from './views/not-found/not-found.view.js';
import { Guards } from './guards.js';

export const appRoutes: Nutin.Routes = {
  '/': () => new HomeView(),                                          // plain-function form
  '/admin': { view: () => new AdminView(), guards: [Guards.requireAuth()] }, // guarded form
  '/404': () => new NotFoundView(),                                   // recommended — see below
};
```

```ts
// main.ts
import { AppRouter } from '../core/index.js';
import { appRoutes } from './routes.js';

AppRouter(appRoutes);
```

```ts
// In the global Nutin namespace: Nutin.RouteGuard, Nutin.ViewFactory, Nutin.RouteConfig, Nutin.Routes
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

export const appRoutes: Nutin.Routes = {
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
- **Keep the first page eager.** A lazy home page costs an extra request before anything renders. You should also keep `/404` eager.
- **Navigation:** guards run first, then the chunk loads. The current view stays on screen until the new one is ready. If another navigation starts meanwhile, the slower one is dropped.
- **Failed loads:** if the chunk can't be loaded (typically a deploy replaced the chunks while a tab was open, or the network dropped), the error is logged and the browser does a full page load of the target URL, which fetches the current build. If the same URL fails again within 10 seconds, or the browser is offline, it's only logged, so a broken chunk can't reload forever.
- **Other `import()` calls** (a component loading a module on demand) get the same recovery when their file can't be fetched and your code doesn't catch the error: a full page load of the current URL. To handle the failure yourself (a fallback, a retry button), `catch` it: the router then leaves it alone.
- **SEO pages:** with `generateSEOFiles`, lazy routes are prerendered like the others.

## A `/404` route (recommended)

When no route matches the current path, the router renders the `'/404'` route: the user gets a clear page, under the URL they asked for, with focus and the page title handled like any other navigation. The generated app includes one (`NotFoundView`). The Markdown feature's guards also redirect an unknown page to `/404`.

Without a `/404` route, the router logs `No 404 route defined` and renders nothing:
- **An in-app link to an unknown path** does nothing: the current page and URL stay. Production builds drop `console` calls, so there's no sign of it.
- **An unknown URL loaded directly** (a typo, an old bookmark, an external link) shows a blank page.

`build` warns when `src/app/routes.ts` has no `'/404'` key. It doesn't stop the build: a `/404` route defined in another file and spread into `appRoutes` can't be seen, so ignore the warning in that case.
