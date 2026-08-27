# How do I create a component?

## Extend `Component`

```ts
// greeting.component.ts
import { Component, ComponentConfig } from '../../../core/index.js';

interface GreetingConfig {
  name?: string;
}

const templateFn = (config?: GreetingConfig) => `
<div>
  <span data-bind="name">${config?.name}</span>
  <button data-event="click:_sayHi">Say hi</button>
</div>
`;

export class GreetingComponent extends Component<HTMLDivElement, GreetingConfig> {
  constructor(mountTarget: HTMLElement, config: GreetingConfig) {
    super({
      templateFn,
      mountTarget,
      config,
      normalizeKeys: ['name'],
      defaults: { name: 'friend' },
    });
  }

  private _sayHi(): void {
    console.log('hi', this.config.name);
  }
}
```

```ts
const greeting = new GreetingComponent(el, { name: 'Ada' });
greeting.render();
```

Constructing a component mounts its root element immediately, but does **not** render it — you must either register it in a parent via [child registration](./HOWDOI_REGISTER_CHILD_COMPONENTS.md) or call `render()` yourself.

## Constructor options

```ts
interface ComponentOptions<K = any> {
  templateFn?: (config?: K) => string;   // default: () => ''
  mountTarget?: string | HTMLElement;    // default: '#app'
  tagName?: keyof HTMLElementTagNameMap; // default: 'div'
  props?: ComponentProps;                // default: {}
  config?: K;
  defaults?: Partial<K>;
  normalizeKeys?: (keyof K)[];
  trustLevel?: 'strict' | 'normal' | 'trusted'; // default: 'normal'
}
```

- `mountTarget` as a CSS selector string **appends** the component into that element; passing an actual `HTMLElement` **replaces** it instead. A selector that matches nothing leaves the component unmounted, silently.
- `templateFn` always receives the *normalized* config — `defaults` merged under `config`, then every key listed in `normalizeKeys` coerced to `''` if it's still `undefined`/`null`. See [How do I pass data to a component?](./HOWDOI_PASS_DATA_TO_A_COMPONENT.md) for the full normalization rules.
- `trustLevel` controls HTML sanitization of the rendered template — see [How do I control HTML sanitization?](./HOWDOI_CONTROL_HTML_SANITIZATION.md).

## Render lifecycle

`render()` runs the same pipeline on every call (initial and any subsequent re-render):

```
onBeforeRender()
element.innerHTML = sanitize(generateTemplate())
compose()      → mounts data-component/data-catalog children (see registerChildren)
hydrate()      → parses data-i18n / data-pipe, then removes empty data-optional elements
autoBindEvents() → rebinds all data-event listeners
onAfterRender()
```

Calling `render()` again while a render is already in progress (e.g. from inside `onBeforeRender`) is a safe no-op — it just returns the current element instead of recursing.

`destroy()` unbinds all `data-event` listeners, unsubscribes every event-bus subscription made via `this.listen(...)`, destroys all tracked children, then removes the element from the DOM. See [What lifecycle hooks are available?](../LIFECYCLE_HOOKS/WHAT_LIFECYCLE_HOOKS_ARE_AVAILABLE.md) for every overridable hook and their exact firing order.
