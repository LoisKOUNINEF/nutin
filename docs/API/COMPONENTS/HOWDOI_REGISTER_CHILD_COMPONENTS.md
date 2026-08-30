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
}
```

`registerChildren()` runs on **every** render (it's called from `compose()`, part of the standard render pipeline). For each config, every `[data-component="selector"]` element currently in the template is matched — if more than one element uses the same selector, each gets its own instance. Each match's element is passed to `factory`, the returned component is rendered immediately, and tracked so `destroy()` can recursively tear it down later.

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

## Gotchas

- Because `registerChildren()`/`createCatalogComponents()` re-run on every render with no diffing, a catalog container is wiped and fully rebuilt each time — any DOM state local to a catalog child (scroll position, focus, unsaved input) is lost on re-render.
- A `data-component` or `data-catalog` container whose `selector` doesn't match renders nothing, silently — check for typos in `selector`/`elementName` first.
