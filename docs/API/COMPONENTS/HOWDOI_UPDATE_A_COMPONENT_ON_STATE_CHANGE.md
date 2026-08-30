# How do I update a component on state change?

There's no separate "dynamic render" API — dynamic rendering relies on events. You can also call `.render()` on it whenever you want.

## Use unherited methods

```ts
class UserCardComponent extends Component {
  /* ... */
  onBeforeRender() {
    this.listenToRenderEvents(['logged-in', 'logged-out']);
  }
}
```

Each call re-runs the whole pipeline — regenerating the template, rebuilding children/catalogs from scratch, and rebinding events. There's no diffing/patching, so a full re-render is the only update mechanism.

See [How do I listen to application events?](../APP_EVENTS/HOWDOI_LISTEN_TO_APPLICATION_EVENTS.md)

## Manual instantiate + render

```ts
const modal = new ConfirmModalComponent(document.body, { message: 'Are you sure?' });
modal.render();
// later:
modal.destroy();
```

`mountTarget` can be a CSS selector string (appends into that element) or an actual `HTMLElement` (replaces it). Mounting happens once, in the constructor; to move a component to a different target, `destroy()` it and construct a new instance.

## Persisting across route changes

For a component that should live outside the router's view tree (a header/footer), use `registerGlobals` — see [How do I mount global components?](../GLOBAL_LAYOUT/HOWDOI_MOUNT_GLOBAL_COMPONENTS.md).

## Views

- Views are rendered dynamically by the `Router` — see [How do I navigate?](../VIEWS_AND_ROUTING/HOWDOI_NAVIGATE.md).

- You could still call `listenToRenderEvents` or call `render()` on views, but this is not the intended way of updating elements. Nutin favors small components that should be updated independently.

- ***Note:*** `Router` listens to the `reload` event to re-render the view itself - destroys and rebuilds the whole `<main>` DOM.

## Gotchas

- Calling `render()` after `destroy()` still runs the full pipeline and mutates `this.element`, but that element is already detached from the document — nothing becomes visible again. Don't reuse a destroyed instance.
