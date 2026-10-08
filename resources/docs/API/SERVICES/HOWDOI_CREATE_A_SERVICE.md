# How do I create a service?

## Generate a service

```bash
npm run generate service services/example # target directory: src/app/services/example
```

## Example service

```ts
// example.service.ts
import { Service } from '../../../core/index.js';

export class ExampleService extends Service<ExampleService> {
  constructor() {
    super();
  }

  public doThing(): void {
    // ...
  }
}

export const exampleService = ExampleService.getInstance();
```

`Service<T>` is an abstract singleton base. Calling `new ExampleService()` directly throws — `getInstance()` is the only valid way to construct one:

```ts
public static getInstance<C extends new (...args: any) => Service<any>>(this: C, ...args: ConstructorParameters<C> | []): InstanceType<C>
```

The arguments are type-checked against the service's constructor (a service without one accepts none), and the result is typed as that service. The first call constructs and caches the instance; every later call returns the same one. Calling `getInstance(...)` **with arguments** after the instance already exists throws — pass constructor args only on the very first call (typically the one in the module that defines the exported const), and call `getInstance()` with no arguments everywhere else.

Every service method is auto-bound to the instance at construction, so its methods can be passed around as bare callbacks without losing `this` — see [How do I use a service?](./HOWDOI_USE_A_SERVICE.md).
