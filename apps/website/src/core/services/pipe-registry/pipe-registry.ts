import { Service } from "../../base-classes/index.js";

export type PipeFunction = (value: any, ...args: any[]) => string;

class PipeRegistry extends Service<PipeRegistry> {
  private _pipes: Record<string, PipeFunction> = {};

  constructor() { super(); }

  public register(name: string, fn: PipeFunction): void {
    if(this._pipes[name]) {
      console.warn(`Skipping pipe "${name}": A pipe with this name already exists.`);
      return;
    }
    this._pipes[name] = fn;
  }

  public apply(name: string, value: any, args: string[] = []): string {
    const pipe = this._pipes[name];
    if (!pipe) {
      console.warn(`Pipe "${name}" not found.`);
      return value;
    }
    return pipe(value, ...args);
  }

  protected onDestroy(): void {
    this._pipes = {};
  }
}

export const AppPipeRegistry = PipeRegistry.getInstance();
