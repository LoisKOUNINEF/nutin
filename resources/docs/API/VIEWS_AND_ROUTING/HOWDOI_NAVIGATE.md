# How do I navigate?

```ts
import { Navigation } from '../../../core/index.js';

private _handleHome(): void {
  Navigation.navigateTo('/');
}
```

```ts
Navigation.navigateTo(path: string): void  // emits 'navigate' with { path }
Navigation.reload(): void                   // emits 'reload', re-renders the current route without pushing history
```

`Navigation.navigateTo(path)` doesn't call the router directly — it emits an event on the app event bus that the `Router` (once installed via [`AppRouter`](./HOWDOI_REGISTER_A_ROUTE.md)) listens for and reacts to. This means calling it before `AppRouter(routes)` has run is a no-op — there's no subscriber yet.

Navigating runs guards, destroys the outgoing view, renders the incoming one, updates browser history, and scrolls to the top. Browser back/forward (`popstate`) is handled automatically and re-renders without pushing new history state, same as `reload()`.
