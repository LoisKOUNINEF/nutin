# How do I access route parameters?

## Dynamic segments

```ts
export const appRoutes: Nutin.Routes = {
  '/posts/:id': () => new PostView(),      // required segment
  '/users/:id?': () => new UsersView(),    // optional segment, must be trailing
};
```

`/posts/:id` matches `/posts/123` but not `/posts`. `/users/:id?` matches both `/users` and `/users/123` — an unmatched optional param is simply absent from the params object, not present with an `undefined` value.

Params are URL-decoded (`/users/J%C3%B6rg` gives `id` = `Jörg`). Static segments match literally: `.` or `+` in a pattern is not a wildcard.

## Reading params inside a view

```ts
export class PostView extends View {
  protected override onBeforeRender(): void {
    const id = this.getRouteParam('id');
    // ...
  }
}
```

```ts
public getRouteParams(): Record<string, string>       // shallow copy of all matched params
public getRouteParam(key: string): string | undefined
public hasRouteParam(key: string): boolean             // use this to check presence of an optional param
```

The router calls `view.setRouteParams(params)` **before** `render()` and `onEnter()` — so route params are always available inside `onBeforeRender()`, `generateTemplate()`, and `onEnter()`.

## Query parameters

The query string is parsed on every route, the default route (`/`) included, and kept apart from route params:

```ts
export const appRoutes: Nutin.Routes = {
  '/': () => new HomeView(),
  '/users/:id': () => new UserView(),
};
```

`/?tab=settings` gives the `HomeView` the query params `{ tab: 'settings' }` (and no route params). `/users/1?id=2` gives the `UserView` the route param `id` = `1` and the query param `id` = `2`.

```ts
export class HomeView extends View {
  protected override onBeforeRender(): void {
    const tab = this.getQueryParam('tab') ?? 'overview';
    // ...
  }
}
```

```ts
public getQueryParams(): Record<string, string>       // shallow copy of all query params
public getQueryParam(key: string): string | undefined
public hasQueryParam(key: string): boolean
```

Values are decoded (`?q=a%20b+c` gives `q` = `a b c`). A repeated key keeps its last value (`?tag=a&tag=b` gives `tag` = `b`). The router sets them with `view.setQueryParams()`, right after `setRouteParams()`, so they're available in the same hooks. The router itself also has `getQueryParams()` and `getQueryParam(key)`. Route guards receive them as their second argument (see [How do I use route guards?](./HOWDOI_USE_ROUTE_GUARDS.md)).

A prerendered (SEO) page is rendered without a query string: its view gets `{}`, so render a sensible default when a query param is absent.
