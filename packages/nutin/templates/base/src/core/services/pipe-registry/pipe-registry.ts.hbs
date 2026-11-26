import { Service } from "../../base-classes/service/service.js";

class PipeRegistry extends Service<PipeRegistry> {
  #pipes: Record<string, Nutin.PipeFunction> = {};

  constructor() { super(); }

  public register(name: string, fn: Nutin.PipeFunction): void {
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
