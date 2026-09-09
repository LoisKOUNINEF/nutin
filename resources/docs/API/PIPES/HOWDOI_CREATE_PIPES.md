# How do I create pipes?

```ts
// main.ts
import { AppPipeRegistry, registerPipes } from '../core/index.js';

registerPipes(); // register the framework's built-in pipes first

AppPipeRegistry.register('slug', (value) =>
  String(value).toLowerCase().trim().replace(/\s+/g, '-')
);
```

```ts
type PipeFunction = (value: any, ...args: any[]) => string;

AppPipeRegistry.register(name: string, fn: PipeFunction): void
AppPipeRegistry.apply(name: string, value: any, args?: string[]): string
```

`AppPipeRegistry` is the singleton instance — it's the only public entry point (the underlying registry class isn't exported). Register your own pipes once at bootstrap, typically right after `registerPipes()` in `main.ts`, and they're immediately usable via `data-pipe="slug"`.

## Gotchas

- **Name collision**: if `name` is already registered, `register()` logs `console.warn('Pipe "${name}" already exists - skipping.')` and keeps the *original* implementation — the new one is silently discarded. Register order matters; the framework's built-ins register first if you call `registerPipes()` before your own registrations.
- **Unregistered name**: calling an unregistered pipe (via `data-pipe` or `AppPipeRegistry.apply`) logs `console.warn('Pipe "${name}" not found.')` and returns the input value **unchanged**, not an error and not an empty string.
