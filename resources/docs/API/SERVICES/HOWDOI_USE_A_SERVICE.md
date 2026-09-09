# How do I use a service?

Import the exported singleton **const**, not the class:

```ts
import { ThemeTogglerService } from '../../../services/index.js';

private _handleToggle(): void {
  ThemeTogglerService.toggleTheme();
}
```

Importing the class instead and calling `new ThemeTogglerService()` throws — see [How do I create a service?](./HOWDOI_CREATE_A_SERVICE.md).

Because every service method is auto-bound to its instance, methods can be destructured or passed directly as callbacks without losing `this`:

```ts
const { toggleTheme } = ThemeTogglerService;
button.addEventListener('click', toggleTheme); // works, `this` still correct
```

Any component, view, or other service can import and call a service's methods the same way — there's no special context required.
