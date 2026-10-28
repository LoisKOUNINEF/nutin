# How do I use route guards?

```ts
// src/app/guards.ts
export const Guards = {
  requireAuth: (redirectTo: string = '/login'): Nutin.RouteGuard => {
    return () => {
      const isAuthenticated = !!localStorage.getItem('user_token');
      return isAuthenticated || redirectTo;
    };
  },
};
```

```ts
export const appRoutes: Nutin.Routes = {
  '/admin': { view: () => new AdminView(), guards: [Guards.requireAuth()] },
};
```

```ts
// Nutin.RouteGuard
type RouteGuard = (
  params: Record<string, string>,
  query: Record<string, string>
) => boolean | string | Promise<boolean | string>;
```

Guards receive the matched route params and the parsed query params (see [How do I access route parameters?](./HOWDOI_ACCESS_ROUTE_PARAMS.md#query-parameters)), not the raw path. They run in array order, stopping at the first non-`true` result:

- `true` — allow; the next guard runs, or the view renders if this was the last one.
- `false` — block the navigation entirely; the router stays on the current route (no re-render, no history change, no redirect).
- a `string` — treated as a redirect path; the router navigates there instead, and that target's own guards are evaluated too (a redirect can chain through further guards). During back/forward, `reload()` or the first load, the redirect replaces the guarded history entry instead of adding one.

Guards can be `async`/return a `Promise` — the router awaits the result before deciding.

A guard on a query param, e.g. `/?invite=<code>`:

```ts
export const Guards = {
  requireValidInvite: (redirectTo: string = '/'): Nutin.RouteGuard => {
    return (_params, { invite }) => invite === undefined || isValidInvite(invite) || redirectTo;
  },
};
```

Redirect to a URL without the guarded query (here `/`), or the guard runs on it again.

With [`generateSEOFiles`](../../OPTIONS_AND_FEATURES/HOWDOI_USE_SEO_FILE_GENERATION.md#guarded-routes), guards also run during prerendering, as for an anonymous first visit (empty `localStorage`, no query string). A route a guard blocks or redirects isn't prerendered and is left out of the sitemap; the build logs it.

There's no core-level convention for where guards live — `src/app/guards.ts` (as above) is a common location, but any module works as long as it's imported by `routes.ts`.
