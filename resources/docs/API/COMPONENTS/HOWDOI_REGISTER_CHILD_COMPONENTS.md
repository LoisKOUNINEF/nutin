# How do I register child components?

## Single children

Override `registerChildren()` and match each entry's `selector` to a `data-component` mount point in your template:

```ts
public registerChildren(): ComponentConfig[] {
  return [
    { selector: 'user-card', factory: (el) => new UserCardComponent(el, { id: 1 }) },
  ];
}
```

```html
<div data-component="user-card"></div>
```

```ts
interface ComponentConfig {
  selector: string;
  factory: (element: HTMLElement) => Component;
  key?: string | number;
}
```

`registerChildren()` runs on **every** render. For each config, every `[data-component="selector"]` element currently in the template is matched — if more than one element uses the same selector, each gets its own instance.

Each match's element is passed to `factory`, the returned component is rendered immediately, and tracked so `destroy()` can recursively tear it down later.

Children without a `key` are destroyed and recreated on every render — see [Keeping children across re-renders](#keeping-children-across-re-renders) to avoid that.

## Repeated children (catalogs)

Use `createCatalogComponents()` instead of hand-writing one entry per item:

```ts
public registerChildren(): ComponentConfig[] {
  return [
    ...this.createCatalogComponents({
      items: this.users,           // array of objects or primitives
      elementName: 'user-item',
      selector: 'users',           // matches [data-catalog="users"]
      elementTag: 'li',            // wrapper tag, default 'div'
      component: UserItemComponent,
    }),
  ];
}
```

```html
<ul data-catalog="users"></ul>
```

```ts
interface CatalogConfig {
  items: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any, props?: any) => Component;
  trackBy?: (item: any, index: number) => string | number;
}
```

For every `[data-catalog="selector"]` container found (there can be more than one), the container's existing `innerHTML` is **cleared entirely**, then one wrapper element is generated per item — each wrapping a `<div data-component="elementName-i">` and stamped with `data-index="i"` — which then flows through the exact same child-mounting path as single children.

### Object vs. primitive items

Each item is turned into the child's `data` argument:

- **Object items** are spread directly and merged with `index`: `{ id: 1, name: 'x' }` → `{ id: 1, name: 'x', index: 0 }`.
- **Primitive items** (string, number, boolean, `null`, `undefined`) can't be spread, so they're wrapped instead: `'red'` → `{ value: 'red', index: 0 }`. Use `config.value` to read the raw primitive back out.

```ts
type CatalogItemConfig<T = any> = T extends object ? T & { index: number } : { value: T; index: number };
```

The third factory argument (`props`) is a shallow merge of the catalog config's own `props`, `defaults`, and `normalizeKeys` fields — in that precedence order.

## Keeping children across re-renders

By default, a parent's re-render destroys and recreates every child, losing its DOM state (focus, scroll position, unsaved input). Give a child a stable identity to keep it instead.

### Single children: `key`

```ts
public registerChildren(): ComponentConfig[] {
  return [
    { selector: 'search', key: 'search', factory: (el) => new SearchComponent(el) },
  ];
}
```

As long as the next render returns the same `key` for that selector, the child is **kept as-is**: its factory isn't called, it isn't re-rendered, and its element is moved into the new placeholder.

A kept child ignores whatever its factory would have passed it this time. 

Choosing a key means the child owns its own updates: either put in the key whatever should recreate it (``key: `${task.id}:${task.updatedAt}` ``), or have the child re-render itself with `listenToRenderEvents()`/`listen()`.

### Catalogs: `trackBy`

```ts
...this.createCatalogComponents({
  items: this.users,
  elementName: 'user-item',
  selector: 'users',
  component: UserItemComponent,
  trackBy: (user) => user.id,
}),
```

An item is kept when its `trackBy` value is the same **and** it hasn't changed: the item is shallow-equal to the previous one (own properties compared with `Object.is`), and the catalog's `props`/`defaults`/`normalizeKeys` and `component` are unchanged.

Changed items are destroyed and recreated. Kept items follow reorders, insertions and removals; their wrapper's `data-index` is updated, but the child's own `config.index` stays the index it was created with.

Without `trackBy`, the catalog is fully rebuilt on every render.

### What a kept child goes through

- No `onBeforeRender`/`onAfterRender`, no destroy hooks: it wasn't rendered or destroyed. Its own `onReuse()` hook is called instead, once it's back in place.
- Its element never leaves the document where `Element.moveBefore()` is supported: iframes don't reload, CSS animations keep running, custom elements get no `disconnectedCallback`, focus and scroll stay. Where it isn't (Safari), the element is detached and re-inserted: focus, caret, scroll and input values are restored, but iframes reload, animations restart and custom elements are disconnected and reconnected.
- Attributes from its placeholder (`class`, `id`...) are copied only when it's created — a kept child doesn't pick up placeholder attribute changes.
- Only the child is kept: the parent's own markup around it, including a `data-catalog` container, is rebuilt as usual. To keep a scrollable list's scroll position, make the scrolling element part of a keyed child.

## Important

- A `data-component` or `data-catalog` container whose `selector` doesn't match renders nothing, silently — **check for typos in `selector`/`elementName` first**.
- Without `key`/`trackBy`, `registerChildren()`/`createCatalogComponents()` re-run on every render with no diffing: a catalog container is wiped and fully rebuilt each time, and any DOM state local to a child (scroll position, focus, unsaved input) is lost on re-render.
- A `key` repeated for the same selector in one render logs a warning; the duplicate is recreated on every render.
