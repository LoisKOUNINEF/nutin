import { Service, AppEventBus } from "../../index.js";

export type StoreState = Record<string, any>;

export class Store extends Service<Store> {
  private _state: StoreState = {};

  constructor() {
    super();
    this.registerCleanup(this.clear);
  }

  public set<T = any>(key: string, value: T): void {
    this._state[key] = value;
    AppEventBus.emit(`store:${key}`, value);
  }

  public get<T = any>(key: string): T | undefined {
    return this._state[key];
  }

  public subscribe<T = any>(key: string, callback: (value: T) => void): void {
    AppEventBus.subscribe(`store:${key}`, callback);
  }

  public unsubscribe<T = any>(key: string, callback: (value: T) => void): void {
    AppEventBus.off(`store:${key}`, callback);
  }

  public clear(): void {
    this._state = {};
  }

  protected onDestroy(): void {
    this.clear();
  }
}

export const AppStore = Store.getInstance();
