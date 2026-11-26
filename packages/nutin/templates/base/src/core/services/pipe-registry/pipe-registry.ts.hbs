import { Service } from "../../base-classes/service/service.js";

class PipeRegistry extends Service<PipeRegistry> {
  #pipes: Record<string, Nutin.PipeFunction> = {};

  constructor() { super(); }

  public register(name: string, fn: Nutin.PipeFunction): void {
    // Dev only (prod bundles drop it): a name like "toString" is found on Object.prototype,
    // so it would be refused below as "already exists", and data-pipe would call the built-in.
    if (!globalThis.__NUTIN_PROD__ && name in Object.prototype) {
      console.warn(`Pipe "${name}" can't be registered: it's a built-in object member's name. Pick another name.`);
      return;
    }
    if(this.#pipes[name]) {
      console.warn(`Pipe "${name}" already exists - skipping.`);
      return;
    }
    this.#pipes[name] = fn;
  }

  public apply(name: string, value: any, args: string[] = []): string {
    const pipe = this.#pipes[name];
    if (!pipe) {
      console.warn(`Pipe "${name}" not found.`);
      return value;
    }
    return pipe(value, ...args);
  }

  protected override onDestroy(): void {
    this.#pipes = {};
  }
}

export const AppPipeRegistry = /* @__PURE__ */ PipeRegistry.getInstance();
