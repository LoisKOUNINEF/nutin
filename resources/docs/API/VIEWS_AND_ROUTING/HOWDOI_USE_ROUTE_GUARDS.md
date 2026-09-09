# How do I use route guards?

```ts
// src/app/guards.ts
import { RouteGuard } from '../core/index.js';

export const Guards = {
  requireAuth: (redirectTo: string = '/login'): RouteGuard => {
    return () => {
      const isAuthenticated = !!localStorage.getItem('user_token');
      return isAuthenticated || redirectTo;
    };
  },
};
```

```ts
export const appRoutes: Routes = {
  '/admin': { view: () => new AdminView(), guards: [Guards.requireAuth()] },
};
```

```ts
type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;
```

Guards receive the matched route params (not the raw path or query string), and run in array order, stopping at the first non-`true` result:

- `true` — allow; the next guard runs, or the view renders if this was the last one.
- `false` — block the navigation entirely; the router stays on the current route (no re-render, no history change, no redirect).
- a `string` — treated as a redirect path; the router navigates there instead, and that target's own guards are evaluated too (a redirect can chain through further guards).

Guards can be `async`/return a `Promise` — the router awaits the result before deciding.

There's no core-level convention for where guards live — `src/app/guards.ts` (as above) is a common location, but any module works as long as it's imported by `routes.ts`.
