# How do I generate a template?

Every component inherits `generateTemplate(): Template` (a string or an `html` result) from `BaseComponent`. `render()` calls it and assigns the (sanitized) result to the component's `innerHTML`. 

You can override it when a template needs more than a single expression.

## When to use it

- The markup branches or is assembled conditionally
- The template needs instance state rather than only the `config` argument a `templateFn` receives.

## In a `Component`

**Don't pass a `templateFn` to `super()`.**
- Override `generateTemplate()` and read from `this.config` instead:

```ts
// avatar.component.ts
import { Component, ComponentProps, html, raw, type Template } from '../../../core/index.js';

interface AvatarConfig {
  alt: string;
  src?: string;
  initials?: string;
  shape?: 'circle' | 'square';
}

export class AvatarComponent extends Component<HTMLDivElement, AvatarConfig> {
  constructor(mountTarget: HTMLElement, config: AvatarConfig, props?: ComponentProps) {
    super({ mountTarget, config, normalizeKeys: ['src', 'initials', 'shape'], props });
  }

  protected override onBeforeRender(): void {
    super.onBeforeRender();
    this.element.classList.add('app-avatar', `avatar--${this.config.shape || 'circle'}`);
  }

  protected override generateTemplate(): Template {
    const { src, alt, initials } = this.config;

    if (src) {
      return html`<img class="avatar__img" src="${src}" alt="${alt}" loading="lazy">`;
    }

    return html`<span class="avatar__initials" aria-hidden="true">${initials}</span>`;
  }
}
```

- Attributes that depend on optional flags can be nested `html` fragments. `false` renders nothing, and `raw()` marks a fixed attribute as markup:

```ts
protected override generateTemplate(): Template {
  const { id, name, checked, disabled } = this.config;

  return html`<input
    type="checkbox"
    ${id && html`id="${id}"`}
    ${name && html`name="${name}"`}
    ${checked && raw('checked')}
    ${disabled && raw('disabled')}
  >`;
}
```

## Notes

- The string you return still goes through the full pipeline: sanitized according to `trustLevel`, then children are mounted, `data-i18n`/`data-pipe` are hydrated, empty `data-optional` elements are removed and `data-event` listeners are bound. 
- Return an `html` template so interpolated data is escaped. A plain template literal escapes nothing, see [How do I control HTML sanitization?](./HOWDOI_CONTROL_HTML_SANITIZATION.md).
- Work on the rendered children (e.g. `querySelector`) belongs in `onAfterRender()`. **In a `Component`, call `super.onBeforeRender()`/`super.onAfterRender()`**.

## See also

- [How do I create a component?](./HOWDOI_CREATE_A_COMPONENT.md)
- [How do I pass data to a component?](./HOWDOI_PASS_DATA_TO_A_COMPONENT.md)
- [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md)
