# How do I listen to application events?

## From a component or view

```ts
export class MyView extends View {
  protected onBeforeRender(): void {
    this.listen('language-changed', () => console.log('language changed'));
    this.listenToRenderEvents(['language-changed']); // re-render whenever it fires
  }
}
```

- `this.listen(event, callback)` (available on every component/view) subscribes and automatically unsubscribes it on destroy. Prefer this over calling `AppEventBus.subscribe` directly, which has no automatic cleanup.

- `this.listenToRenderEvents([...events])` is a shortcut that re-renders the component whenever any of the given events fire - uses `this.listen` under the hood.

## Directly via `AppEventBus`

```ts
import { AppEventBus } from '../../../core/index.js';

AppEventBus.subscribe('language-changed', (data) => console.log(data.lang));
AppEventBus.once('language-changed', (data) => { /* fires once, then auto-unsubscribes */ });
AppEventBus.emit('language-changed', { lang: 'fr' });
AppEventBus.off('language-changed', callback); // omit callback to remove ALL handlers for that event
```

- `subscribe`/`once` return `void`, not an unsubscribe function — to unsubscribe you must call `AppEventBus.off(event, callback)` yourself with the same callback reference. This is why `this.listen(...)` (which handles that bookkeeping for you) is preferred inside a component/view.

See [How do I emit events?](./HOWDOI_EMIT_EVENTS.md) for adding your own typed events to `EventMap`.
