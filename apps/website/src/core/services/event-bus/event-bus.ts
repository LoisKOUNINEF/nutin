import { Service } from "../../base-classes/service/service.js";

// The payload is required unless the event declares none (`undefined` in its EventMap entry).
type EventArgs<K extends Nutin.EventKey> = undefined extends Nutin.EventMap[K] ? [data?: Nutin.EventMap[K]] : [data: Nutin.EventMap[K]];

export class EventBus extends Service<EventBus> {
  private _subscriptions: Nutin.Subscription[] = [];

  constructor() {
    super();
    this.registerCleanup(this.cleanupEventListeners);
  }

  private handlers: {
    [K in Nutin.EventKey]?: Array<(data: Nutin.EventMap[K]) => void>;
  } = {};

  public subscribe<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void
  ): void {
    this.addHandler(event, callback, false);
  }

  public once<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void
  ): void {
    this.addHandler(event, callback, true);
  }

  public emit<K extends Nutin.EventKey>(event: K, ...[data]: EventArgs<K>): void {
    const callbacks = this.handlers[event];
    if (!callbacks) return;

    callbacks.slice().forEach(callback => {
      // A failing listener is reported but doesn't keep the others (the router's
      // included) from receiving the event.
      try {
        callback(data as Nutin.EventMap[K]);
      } catch (error) {
        console.error(`Error in a "${event}" listener:`, error);
      }

      const subIndex = this._subscriptions.findIndex(
        sub => sub.event === event && sub.callback === callback && sub.once
      );
      if (subIndex > -1) {
        this.off(event, callback);
      }
    });
  }

  public off<K extends Nutin.EventKey>(
    event: K,
    callback?: (data: Nutin.EventMap[K]) => void
  ): void {
    const handlers = this.handlers[event];
    if (!handlers) return;

    if (callback) {
      (this.handlers as Record<
        Nutin.EventKey,
        Array<(data: Nutin.EventMap[K]) => void>
      >)[event] = handlers.filter(h => h !== callback);
    } else {
      delete this.handlers[event];
    }

    this._subscriptions = this._subscriptions.filter(
      sub => sub.event !== event || (callback && sub.callback !== callback)
    );
  }

  private addHandler<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void,
    once: boolean
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    (
      this.handlers as Record<Nutin.EventKey, Array<(data: Nutin.EventMap[K]) => void>>
    )[event].push(callback);
    this._subscriptions.push({ event, callback, once } as Nutin.Subscription);
  }

  private cleanupEventListeners = (): void => {
    this._subscriptions.forEach(({ event, callback }) => {
      this.off(event, callback);
    });
    this._subscriptions = [];
  };
}

export const AppEventBus = /* @__PURE__ */ EventBus.getInstance();
