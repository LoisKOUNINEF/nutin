import { Service } from "../../base-classes/service/service.js";

// The payload is required unless the event declares none (`undefined` in its EventMap entry).
type EventArgs<K extends Nutin.EventKey> = undefined extends Nutin.EventMap[K] ? [data?: Nutin.EventMap[K]] : [data: Nutin.EventMap[K]];

// What useEventBus() accepts: the bus's public API, e.g. testin-nutin's MockEventBus.
export type EventBusApi = Pick<EventBus, 'subscribe' | 'once' | 'emit' | 'off'>;

// Set by useEventBus() (tests): the bus every call is routed to instead.
let delegate: EventBusApi | null = null;

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
    if (delegate && delegate !== this) return delegate.subscribe(event, callback);
    this.addHandler(event, callback, false);
  }

  public once<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void
  ): void {
    if (delegate && delegate !== this) return delegate.once(event, callback);
    this.addHandler(event, callback, true);
  }

  public emit<K extends Nutin.EventKey>(event: K, ...[data]: EventArgs<K>): void {
    if (delegate && delegate !== this) return delegate.emit(event, ...([data] as EventArgs<K>));
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
    if (delegate && delegate !== this) return delegate.off(event, callback);
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

/**
 * For tests: routes every subscribe/once/emit/off made through AppEventBus to `bus`, e.g.
 * testin-nutin's MockEventBus. That covers components' `listen()`, the Navigation and Lifecycle
 * facades, the router, i18n and app services alike. Pass null to restore the real bus.
 * A subscription stays on the bus it was made on: set it before mounting, restore after destroying.
 */
export function useEventBus(bus: EventBusApi | null): void {
  delegate = bus;
}
