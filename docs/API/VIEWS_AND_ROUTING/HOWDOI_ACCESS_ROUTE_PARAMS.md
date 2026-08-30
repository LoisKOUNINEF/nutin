# How do I access route parameters?

## Dynamic segments

```ts
export const appRoutes: Routes = {
  '/posts/:id': () => new PostView(),      // required segment
  '/users/:id?': () => new UsersView(),    // optional segment, must be trailing
};
```

`/posts/:id` matches `/posts/123` but not `/posts`. `/users/:id?` matches both `/users` and `/users/123` — an unmatched optional param is simply absent from the params object, not present with an `undefined` value.

## Reading params inside a view

```ts
export class PostView extends View {
  protected onBeforeRender(): void {
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
