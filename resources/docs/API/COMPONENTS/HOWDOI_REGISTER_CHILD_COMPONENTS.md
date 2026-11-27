# How do I register child components?

## Single children

Override `registerChildren()` and match each entry's `selector` to a `data-component` mount point in your template:

```ts
public override registerChildren(): Nutin.ComponentConfig[] {
  return [
    { selector: 'user-card', factory: (el) => new UserCardComponent(el, { id: 1 }) },
  ];
}
```

```html
<div data-component="user-card"></div>
```

```ts
// Nutin.ComponentConfig
interface ComponentConfig {
  selector: string;
  factory: (element: HTMLElement) => Component;
  keep?: string | number;
}
```

`registerChildren()` runs on **every** render. For each config, every `[data-component="selector"]` element currently in the template is matched — if more than one element uses the same selector, each gets its own instance.

Each match's element is passed to `factory`, the returned component is rendered immediately, and tracked so `destroy()` can recursively tear it down later.

The placeholder is **replaced** by the child's root element, and its attributes are copied onto it (`class` is merged, `data-component` is dropped). That lets the parent decide where the child sits:

```html
<!-- the child's root gets "card__footer", styled by the parent -->
<div class="card__footer" data-component="actions"></div>
```

The selector may be interpolated, which replaces an `if` around two placeholders: list both children in `registerChildren()`, and only the one in the template mounts.

```html
<div data-component="${config.editing ? 'editor' : 'preview'}"></div>
```

For a child that sits inline, give it `tagName: 'span'` and `display: contents` on its root, so the root adds no box of its own.

Children without `keep` are destroyed and recreated on every render — see [Keeping children across re-renders](#keeping-children-across-re-renders) to avoid that.

## Catalog or nutinFor?

A list doesn't always need child components. `nutinFor()` writes the items' markup in the parent's template (see [How do I use `nutinIf`, `nutinFor` and `nutinElse`?](./HOWDOI_USE_NUTINIF_NUTINFOR_AND_NUTINELSE.md)):

| | Catalog | `nutinFor` |
|---|---|---|
| Each item is | a child component, with its own lifecycle | markup in the parent's template |
| Events | bound to the item's component | bound to the parent's handlers (`@dataset:` for the item's id) |
| Across a parent re-render | kept with `keepBy` (focus, scroll, typed input) | rebuilt, like the rest of the template |
| DOM shape | a wrapper (`elementTag`) and the component root per item | exactly the markup written |
| Empty state | an empty container | `.nutinElse(…)` |

- **`nutinFor`** for display lists whose interactions the parent handles: links, nav, breadcrumbs, tags, `<option>`s, table rows, a table of contents.
- **A catalog** when an item has its own behaviour or state (inputs, toggles, async work), or must survive a parent re-render.

**Important:** A `data-component` placeholder inside `nutinFor` items mounts one child per item, all from the same factory. A `keep` on it is matched by position, so reordering the list hands a kept child to another item: **use a catalog's `keepBy` for that**.

## Repeated children (catalogs)

Use `createCatalogComponents()` instead of hand-writing one entry per item:

```ts
public override registerChildren(): Nutin.ComponentConfig[] {
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
// Nutin.CatalogConfig
interface CatalogConfig {
  items?: readonly unknown[] | null;  // null/undefined: an empty catalog
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any, props?: any) => Component;
  keepBy?: (item: any, index: number) => string | number;
}
```

For every `[data-catalog="selector"]` container found (there can be more than one), the container's existing `innerHTML` is **cleared entirely**, then one wrapper element is generated per item, each wrapping a `<div data-component="elementName-i">` and stamped with `data-index="i"`, which then flows through the exact same child-mounting path as single children. An empty list leaves the containers as they are.

`items` is an array. For a `Set`, a `Map` or another iterable, pass `Array.from(set)` or `[...map.values()]`. In dev builds, a value without a numeric `length` (which would render nothing) or a string (one item per character) logs a warning.

### Object vs. primitive items

Each item is turned into the child's `data` argument:

- **Object items** are spread directly and merged with `index`: `{ id: 1, name: 'x' }` → `{ id: 1, name: 'x', index: 0 }`.
- **Primitive items** (string, number, boolean, `null`, `undefined`) can't be spread, so they're wrapped instead: `'red'` → `{ value: 'red', index: 0 }`. Use `config.value` to read the raw primitive back out.

```ts
// Nutin.CatalogItemConfig
type CatalogItemConfig<T = any> = T extends object ? T & { index: number } : { value: T; index: number };
```

The third factory argument (`props`) is a shallow merge of the catalog config's own `props` and `defaults` fields; `defaults` win on a shared key.

### Components used both in and out of a catalog

A component can be mounted as a single child (no `index`) and from a catalog (with `index`). Type its data with `Nutin.CatalogItemBase` made optional:

```ts
type ProjectData = IProject & Partial<Nutin.CatalogItemBase>;

const templateFn = (project: ProjectData) => html`
  <article class="${project.index === undefined ? 'project--standalone' : ''}">${project.name}</article>
`;
```

Avoid the union `IProject | Nutin.CatalogItemConfig<IProject>`: TypeScript doesn't allow reading `project.index` on it, since `IProject` has no `index`. `Nutin.CatalogItemConfig<IProject>` is still assignable to `ProjectData`.

## Keeping children across re-renders

By default, a parent's re-render destroys and recreates every child, losing its DOM state (focus, scroll position, unsaved input). Give a child a stable identity to keep it instead.

### Single children: `keep`

```ts
public override registerChildren(): Nutin.ComponentConfig[] {
  return [
    { selector: 'search', keep: 'search', factory: (el) => new SearchComponent(el) },
  ];
}
```

As long as the next render returns the same `keep` value for that selector, the child is **kept as-is**: its factory isn't called, it isn't re-rendered, and its element is moved into the new placeholder.

A kept child ignores whatever its factory would have passed it this time. 

Choosing a `keep` value means the child owns its own updates: either put in it whatever should recreate the child (``keep: `${task.id}:${task.updatedAt}` ``), or have the child re-render itself with `listenToRenderEvents()`/`listen()`.

### Catalogs: `keepBy`

```ts
...this.createCatalogComponents({
  items: this.users,
  elementName: 'user-item',
  selector: 'users',
  component: UserItemComponent,
  keepBy: (user) => user.id,
}),
```

An item is kept when its `keepBy` value is the same **and** it hasn't changed: the item is shallow-equal to the previous one (own properties compared with `Object.is`), and the catalog's `props`/`defaults` and `component` are unchanged.

`props`/`defaults` are compared shallowly as well: the same values, by `Object.is`. A value that's a new object or function on every render recreates every item each time:

```ts
// Every render passes a new arrow function: no item is ever kept.
props: { onPick: (id: string) => this._pick(id) },

// The same function every render: unchanged items are kept.
private readonly _onPick = (id: string) => this._pick(id);
// ...
props: { onPick: this._onPick },
```

The same goes for `component`: declare the item class at module level, not inside `registerChildren()`, or every render passes a new class and nothing is kept.

Changed items are destroyed and recreated. Kept items follow reorders, insertions and removals; their wrapper's `data-index` is updated, but the child's own `config.index` stays the index it was created with.

Without `keepBy`, the catalog is fully rebuilt on every render.

### What a kept child goes through

- No `onBeforeRender`/`onAfterRender`, no destroy hooks: it wasn't rendered or destroyed. Its own `onKept()` hook is called instead, once it's back in place.
- Its element never leaves the document where `Element.moveBefore()` is supported: iframes don't reload, CSS animations keep running, custom elements get no `disconnectedCallback`, focus and scroll stay. Where it isn't (Safari), the element is detached and re-inserted. Focus, caret, text selection, scroll, input values, CSS animation progress and open popovers are restored. Iframes reload, CSS transitions restart, modal dialogs close and custom elements are disconnected and reconnected.
- Attributes from its placeholder (`class`, `id`...) are copied only when it's created — a kept child doesn't pick up placeholder attribute changes.
- Only the child is kept: the parent's own markup around it, including a `data-catalog` container, is rebuilt as usual. To keep a scrollable list's scroll position, make the scrolling element part of a kept child.

## Calling into children

A parent can call a public method on its children: patch one catalog item instead of re-rendering the whole list, collect state the items own (unsaved input for a "Save all"), or focus and scroll to one. Look the instances up instead of `querySelector`-ing into their DOM:

```ts
import { getChildComponents, getCatalogComponents } from '../../../core/index.js';
```

### Children of a class: `getChildComponents()`

```ts
// Every PanelComponent child, typed as PanelComponent[]
getChildComponents(this, PanelComponent).forEach(panel => panel.paint(state));
```

It returns the parent's children that are instances of that class, subclasses included, in DOM order: several for a placeholder repeated in `nutinFor` items, and catalog items of that class too (use `getCatalogComponents()` for those).

To tell apart two placeholders of the same class, give them an attribute: it's copied onto the child's root.

```html
<div class="sidebar" data-component="sidebar-panel"></div>
<div class="main" data-component="main-panel"></div>
```

```ts
const sidebar = getChildComponents(this, PanelComponent).find(panel => panel.getElement().matches('.sidebar'));
```

Declare the class at module level: a class defined inside `registerChildren()` is a new class on every render, and no child is ever an instance of the one you pass.

### Catalog items: `getCatalogComponents()`

```ts
// The items of [data-catalog="tasks"], in DOM order
const cards = getCatalogComponents<TaskCardComponent>(this, 'tasks');
cards[i].paint(row);

// One item by id
const card = getCatalogComponents<TaskCardComponent>(this, 'tasks')[this.tasks.findIndex(task => task.id === id)];
```

- With one container, `cards[i]` is `items[i]`. Several containers with the same selector come one after the other, each with every item.
- A `findIndex` of `-1` gives `undefined`.
- The type is an unchecked cast, as for a single child kept from its factory. In JavaScript, cast it with `/** @type {TaskCardComponent[]} */ (getCatalogComponents(this, 'tasks'))`.
- With `keepBy`, a kept item's own `config.index` is the index it was created with (see [Catalogs: `keepBy`](#catalogs-keepby)). Map back to the data by position, never by `config.index`.

### When to call them

- Both read the DOM on each call: call them where you need them (`onAfterRender()`, a `data-event` handler, a public method of the parent), and don't keep the result across renders. After a re-render, a recreated child is a new instance, and the old one has `isDestroyed`.
- In `onBeforeRender()`, they return the previous render's children. From a child's constructor or render, while the parent is mounting its children, they return only part of them.
- Children of nested components are skipped: a grandchild is reached through its own parent.
- Use them for transient work: patches, reads, focus. Data still goes through `items` and `render()`. A patch that the parent's data doesn't hold is lost when that item is recreated.

## Important

- A `data-component` or `data-catalog` container whose `selector` doesn't match renders nothing, silently — **check for typos in `selector`/`elementName` first**.
- Without `keep`/`keepBy`, `registerChildren()`/`createCatalogComponents()` re-run on every render with no diffing: a catalog container is wiped and fully rebuilt each time, and any DOM state local to a child (scroll position, focus, unsaved input) is lost on re-render.
- A `keep` value repeated for the same selector in one render logs a warning; the duplicate is recreated on every render.
- A `data-component` placeholder inside `nutinFor` items mounts one child per item, all from the same factory. A `keep` on it is matched by position, so reordering the list hands a kept child to another item: **use a catalog's `keepBy` for that**.
