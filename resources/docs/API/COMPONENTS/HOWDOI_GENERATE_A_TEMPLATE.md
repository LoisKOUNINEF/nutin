# How do I generate a template?

Every component inherits `generateTemplate(): Nutin.Template` (a string or an `html` result) from `BaseComponent`. `render()` calls it, sanitizes the result and inserts the resulting nodes into the component's element. 

You can override it when a template needs more than a single expression.

## When to use it

- The template is assembled step by step (several early returns, loops over computed parts)
- The template needs instance state rather than only the `config` argument a `templateFn` receives.

For markup that only branches, `nutinIf()` keeps the if/else in the template itself, `.html` files included, with no override:

```ts
import { html, nutinIf } from '../../../core/index.js';

const templateFn = (config: AvatarConfig) => html`
  ${nutinIf(Boolean(config.src), () => html`<img class="avatar__img" src="${config.src}" alt="${config.alt}">`)
    .nutinElse(html`<span class="avatar__initials" aria-hidden="true">${config.initials}</span>`)}
`;
```

- A branch is a plain string, an `html` result, `raw()`, `trustedRaw()`, or a thunk returning one. It behaves exactly as if written in place of the call: a plain string is escaped inside `html`, but is markup when `nutinIf` is returned directly from `generateTemplate()`.
- Only the branch taken is called and rendered: pass a thunk (`() => html\`…\``) for a branch that is costly to build or reads data that may be missing. The untaken branch's `data-component` children are never mounted.
- Without `.nutinElse()`, a false condition renders nothing.
- Else-if: pass a thunk as the else, `nutinIf(a, x).nutinElse(() => nutinIf(b, y).nutinElse(z))`.
- The condition must be a `boolean`. With `&&`, `${items.length && html\`…\`}` renders `0` for an empty list; `nutinIf(items.length > 0, …)` can't. A non-boolean condition warns in development.
- In a component whose template is a `.html` file, keep the `nutinIf` import in its code file even though the editor reports it as unused.

## In a `Component`

**Don't pass a `templateFn` to `super()`.**
- Override `generateTemplate()` and read from `this.config` instead:

```ts
// avatar.component.ts
import { Component, html, raw } from '../../../core/index.js';

interface AvatarConfig {
  alt: string;
  src?: string;
  initials?: string;
  shape?: 'circle' | 'square';
}

export class AvatarComponent extends Component<HTMLDivElement, AvatarConfig> {
  constructor(mountTarget: HTMLElement, config: AvatarConfig, props?: Nutin.ComponentProps) {
    super({ mountTarget, config, normalizeKeys: ['src', 'initials', 'shape'], props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.classList.add('app-avatar', `avatar--${this.config.shape || 'circle'}`);
  }

  protected override generateTemplate(): Nutin.Template {
    const { src, alt, initials } = this.config;

    if (src) {
      return html`<img class="avatar__img" src="${src}" alt="${alt}" loading="lazy">`;
    }

    return html`<span class="avatar__initials" aria-hidden="true">${initials}</span>`;
  }
}
```

- Attributes that depend on optional flags can be nested `html` fragments. A false `nutinIf` renders nothing, and `raw()` marks a fixed attribute as markup:

```ts
protected override generateTemplate(): Nutin.Template {
  const { id, name, checked, disabled } = this.config;

  return html`<input
    type="checkbox"
    ${nutinIf(Boolean(id), () => html`id="${id}"`)}
    ${nutinIf(Boolean(name), () => html`name="${name}"`)}
    ${nutinIf(Boolean(checked), raw('checked'))}
    ${nutinIf(Boolean(disabled), raw('disabled'))}
  >`;
}
```

## Notes

- The template you return still goes through the full pipeline: sanitized according to `trustLevel`, then children are mounted, `data-i18n`/`data-pipe` are hydrated, empty `data-optional` elements are removed and `data-event` listeners are bound. 
- Return an `html` template so interpolated data is escaped. A plain template literal escapes nothing, see [How do I control HTML sanitization?](./HOWDOI_CONTROL_HTML_SANITIZATION.md).
- Work on the rendered children (e.g. `querySelector`) belongs in `onAfterRender()`. **In a `Component`, call `super.onBeforeRender()`/`super.onAfterRender()`**.

## See also

- [How do I create a component?](./HOWDOI_CREATE_A_COMPONENT.md)
- [How do I pass data to a component?](./HOWDOI_PASS_DATA_TO_A_COMPONENT.md)
- [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md)
