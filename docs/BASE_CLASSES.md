# Core Docs

## Quick orientation

* **Base classes**: `BaseComponent`, `Component`, `View`, `Service` (all exported from `core/base-classes`).
* **Helpers**: `DomHelper`, `EventHelper`, `TokenHelper`, `PipeHelper`, `ChildrenHelper`, `I18nHelper`, `CatalogHelper`, `SecurityHelper`.
* **Philosophy**: tiny, composition-friendly components; HTML-first templates with `data-*` attributes for binding; services are singletons and provide app-wide capabilities.

## Table Of Content

- 1. [BaseComponent](#1-base-component)
- 2. [Component](#2-component)
- 3. [View](#3-view)
- 4. [Service](#4-service)
- 5. [Event Token System](#5-event-token-system)
- 6. [Key helpers quick reference and examples](#6-key-helpers-quick-reference-and-examples)
- 7. [Common Patterns and Recipes](#7-common-patterns-and-recipes)
- 8. [Where to look in code](#8-where-to-look-in-code)

## 1. BaseComponent

`BaseComponent` is the initial building block. `Component` and `View` are its subclasses; it's not meant to be directly extended when developing an app. It handles:

* mounting a root element
* a lifecycle (`render`, `destroy`)
* helper integrations (event binding, pipes, i18n, children, catalog)

### Typical lifecycle

* `constructor(...)` (subclass provides setup)
* `render()` — place the element in the DOM (calls helper parsing)
* `destroy()` — unmount, remove listeners, destroy children


### Built-in conveniences (called on lifecycle, you don't need to use them directly):

* `DomHelper.mountElement` — mounts or replaces target
* `EventHelper.bindEvents` — scans `data-event` and wires handlers + token substitution. Handles basic input security (see [SecurityHelper](#security-helper))
* `PipeHelper.parsePipeAttributes` — resolves `data-pipe` into rendered content
* `I18nHelper.parseI18nAttributes` — resolves `data-i18n` into text/placeholder
* `ChildrenHelper.addChildren` — instantiate child components found by `data-component`
* `CatalogHelper.generateCatalog` — helper to render repeated components (list catalogs)
* `SecurityHelper` - sanitize inputs

## 2. Component

`Component` extends `BaseComponent` and adds common UI helpers:

* props / attributes mapping (apply simple `props` to element)
* small button management utilities
* data-binding helpers

### Example

```ts
import { Component, ComponentConfig } from '../../../core/index.js';
import { TasksService } from '../../services/index.js';
import { ButtonComponent } from '../index.js';

const templateFn = () => `
<div data-component="add-task"></div>
`;

export class AddTaskComponent extends Component {
  constructor(mountTarget: HTMLElement) {
    super({templateFn, mountTarget});
  }

  private addTask() {
    TasksService.addTask();
  }

  public childConfigs(): ComponentConfig[] {
    return [
      {
        selector: `add-task`,
        factory: (el) => new ButtonComponent(
          el, 
          { 
            textContent: 'New Task', 
            callback: () => this.addTask(), 
            className: 'task-catalog__add-task-button' 
          }
        )
      }
    ]
  }
}
```

## 3. View

`View` extends `BaseComponent` and is the intended place for route-level UI.

* default tag: `section`
* has `viewName` and `routeParams`
* lifecycle hooks: `onEnter()` (called when the view mounts) and `onExit()` (when it unmounts)
* route params methods: `hasRouteParam(string)`, `setRouteParam(string)`, `getRouteParam(string)`, `getRouteParams()`

### Example

```ts
import { AppEventBus, ComponentConfig, View } from '../../../core/index.js';
import { ButtonComponent } from '../../components/index.js';

const template = `<div 
  class="u-flex-center u-flex-column u-padd-y-large"
>
  <h1 
    class="u-color-sec u-font-largest u-bold u-font-secondary"
  >Page Not Found</h1>
  <img src="/assets/images/logo-small-trans.avif" width=250 height=250 alt="nutin's small logo with a growing plant.">
  <div data-component="home"></div>
</div>`;

export class NotFoundView extends View {
  constructor() {
    super({template});
  }

  childConfigs(): ComponentConfig[] {
    const btnClass = 'u-bg-inherit u-font-large u-padd-y-medium u-color-prim u-italic';
    return [
      { 
        selector: 'home',
        factory: (el) => new ButtonComponent(el, { textContent: 'Back to home', callback: () => this.handleHome(), className: btnClass })
      },
    ]
  }

  handleHome() {
    AppEventBus.emit('navigate', '/');
  }
}

// usage (manual)
const v = new NotFoundView();
v.render();

// usage (router)
'/404': () => new NotFoundView()
```

> `render()` calls `onEnter()` and `destroy()` calls `onExit()`.


## 4. Service

Services are **enforced singletons**. You must obtain a service via its `getInstance()` static accessor (each concrete service exposes that). Direct `new` on a subclass will throw — the `Service` base class prevents accidental multiple instances.                     
***Services generated with generator `npm run generate service` will export the `getInstance` return value directly.***

### Example

```ts
import { Service } from "../../../core/index.js";

export class Example extends Service<Example> {
  constructor() {
    super();
    this.registerCallback();
  }

  protected registerCallback(): void { 
    console.debug('No cleanup callbacks registered for service: Example')
  }

  protected onDestroy(): void {
    this.dispose();
  }
}

export const exampleService = Example.getInstance();
```

### Cleanup & testing hooks

* `Service` provides `registerCleanup(fn)` so services can register teardown logic.
* Services are disposed automatically on page unload (and can be manually cleaned in tests).
* Test helpers exist (`testingReset`, `testingResetAll`) to clear instances during unit tests.

## 5. Event Token System

When binding events with data-event, you can use tokens (@value, @id, etc.) to pass dynamic values into your component methods.

Example:
```html
<input 
  type="text" 
  id="username"
  value="John" 
  data-event="change:updateUser:@id,@value" 
/>
```
```ts
updateUser(id: string, value: string) {
  console.log("Update", id, value);
}
```

### Built-in Tokens

```
# exact tokens
@id, @class, @name, @tag
@value, @checked, @selected
@textContent, @innerText, @html
@event, @target
@x, @y (mouse position)
@key, @code (keyboard events)

# prefixed tokens
@attr:foo → attribute value
@dataset:bar → dataset value
```

### Custom Tokens
You can extend the system in two ways:

- Exact Tokens (registerCustomToken)

```ts
// Use this when your token is fixed (no variable part).
import { TokenHelper } from "./helpers/token.helper.js";

TokenHelper.registerCustomToken("@timestamp", () => Date.now());
```
Usage:
```html
<button data-event="click:save:@timestamp">Save</button>
```

- Prefix Tokens (registerPrefixedToken)
```ts
// Use this when your token has a dynamic suffix.
TokenHelper.registerPrefixedToken("@style:", (prop, el) => {
  return el.style[prop] ?? "";
});
```
Usage:
```html
<button data-event="click:log:@style:color">Check color</button>
```
This example resolves @style:color → element’s CSS color.

- When to Use What?

Use registerToken for one-off shortcuts (@foo)
Use registerPrefix for repeatable patterns (@foo:bar)

## 6. Key helpers quick reference and examples

### PipeHelper

* Use `data-pipe` to transform values for display using registered pipes (the `AppPipeRegistry`).

Example:

```html
<span data-pipe="uppercase | trim">raw</span>
```

Pipes are applied left-to-right; `data-pipe-source` can choose which attribute provides the source value.

* You can register new pipes with `AppPipeRegistry.register(name: string, fn: PipeFunction)`

### I18nHelper

* Use `data-i18n="KEY"` to set translated text/placeholder.

Example:

```html
<label data-i18n="user.name.label"></label>
<input data-i18n="user.email.placeholder" />
```

### ChildrenHelper & CatalogHelper

* `ChildrenHelper` looks for `data-component="selector"` and instantiates child components using `ComponentConfig` produced by `childConfigs()`.

* `CatalogHelper` helps render repeated component instances from arrays (useful for lists/grids). It generates `ComponentConfig[]` that the `BaseComponent` can consume. ***Use index access with `config.index`***.

**Notes:** *Primitive data arrays (string, number, etc) needs to be accessed with `config.value`.*

* `BaseComponent` subclasses inherit the `catalogConfig` method that generates `ComponentConfig[]`.

Small catalog pattern:

```ts
this.catalogConfig({ 
  array: users,
  elementName: 'user-item', 
  component: UserItemComponent, 
  selector: 'user-item' 
});
```

### SecurityHelper

* Helpers for escaping/sanitising input and text to avoid injection when inserting text into the DOM.

* Use `SecurityHelper.escapeHtml()` when you need to insert arbitrary strings into innerHTML or attributes.

* Called by default by `TokenHelper` for all registered tokens for `input`, `textarea` and `contenteditable`.

- **XSS Test Cases Examples :**

Basic script injection :
`"><script>alert('XSS')</script>`

Image onerror :
`"><img src=x onerror=alert('XSS')>`

SVG injection :
`"><svg onload=alert('XSS')>`

Template literal escape (if using backticks) :
`${alert('XSS')}`

Event handler attributes:
`" onmouseover="alert('XSS')"`

## 7. Common patterns and recipes

### a) Component with events + pipes + i18n

```html
<!-- template for MyWidget -->
<div>
  <h3 data-i18n="widget.title"></h3>
  <input name="amount" data-bind="amount" data-event="input:onAmount:@value" />
  <button data-event="click:onSave:@dataset:itemId">Save</button>
  <p data-pipe="currency:EUR">0</p>
</div>
```

```ts
class MyWidget extends Component {
  onAmount(value: string) { /* ... */ }
  onSave(itemId: string) { /* ... */ }
}
```

### b) Service usage & cleanup

```ts
class Ticker extends Service<Ticker> {
  private timer?: number;
  constructor() {
    super();
    this.registerCleanup(() => clearInterval(this.timer));
  }

  start() { this.timer = window.setInterval(() => /* tick */ , 1000); }
}

export const TickerService = Ticker.getInstance();
```

### c) Testing notes

* Services expose `testingReset()` / `testingResetAll()` helpers so tests can reset singletons between runs.

* Components can be instantiated from HTML fixtures and `render()` called to exercise helpers.

## 8. Where to look in code

* `src/core/base-classes/base-component/` — core lifecycle + helpers
* `src/core/base-classes/component/` — component implementation
* `src/core/base-classes/view/` — view implementation
* `src/core/base-classes/service/` — base Service + testing helpers
* `src/core/base-classes/base-component/helpers/` — `event.helper.ts`, `token.helper.ts`, `pipe.helper.ts`, `i18n.helper.ts`, `children.helper.ts`, `catalog.helper.ts`, `security.helper.ts`.
* `src/core/base-classes/component/helpers/` — `config.helper.ts`, `data-binding.helper.ts`
