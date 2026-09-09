# How do I pass data to a component?

`Component` has two independent mechanisms for feeding it data — pick based on whether the value drives template rendering, or a form field.

## `config` — data for `templateFn`

```ts
const templateFn = (config?: { name?: string }) => `<span>${config?.name}</span>`;

export class GreetingComponent extends Component {
  constructor(mountTarget: HTMLElement, config: { name?: string }) {
    super({ templateFn, mountTarget, config, normalizeKeys: ['name'], defaults: { name: 'friend' } });
  }
}
```

On every render, `config` is merged under `defaults`, then every key listed in `normalizeKeys` is coerced back to `''` if the *original* `config` value was `undefined`/`null` — **even if `defaults` supplied a value for that same key**. In other words, a key in `normalizeKeys` always ends up as `''` (not the default) when the caller didn't pass it. Only list a key in `normalizeKeys` if you want that behavior; otherwise omit it and let `defaults` fill the gap.

## `props` + `data-bind` — two-way field binding

```ts
const form = new UserFormComponent(el, { props: { name: 'Ada', email: '' } });
form.render();
```

```html
<input data-bind="name">
<textarea data-bind="bio"></textarea>
```

- **Writing in**: after each render, every `[data-bind="key"]` element has `props[key]` written into it (`.value` for `<input>`/`<textarea>`, `.textContent` otherwise) — but only if `props[key] !== undefined`; an unset key leaves the element's existing content untouched.
- **Reading back**: call `getValues()` to read the *current DOM state* of every `[data-bind]` element, not the original `props` object:

```ts
const values = form.getValues(); // { name: '<whatever the input currently contains>', bio: '' }
```

This means `getValues()` reflects live user edits even though `this.props` still holds the construction-time values. `props` values are only re-applied on an explicit `render()` call — mutating `this.props` between renders has no effect until you render again.

`props.className` and `props.style` get special generic handling (applied in `onBeforeRender`, before `data-bind`): `className` is added via `classList.add` (additive — a changed `className` across renders won't remove the old class), and `style` fully replaces the element's `cssText` each render (not additive).

See also [How do I create a component?](./HOWDOI_CREATE_A_COMPONENT.md) for the full constructor option list.
