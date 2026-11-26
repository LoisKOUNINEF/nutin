import { Service } from "../../base-classes/service/service.js";

// The payload is required unless the event declares none (`undefined` in its EventMap entry).
type EventArgs<K extends Nutin.EventKey> = undefined extends Nutin.EventMap[K] ? [data?: Nutin.EventMap[K]] : [data: Nutin.EventMap[K]];

// What useEventBus() accepts: the bus's public API, e.g. testin-nutin's MockEventBus.
export type EventBusApi = Pick<EventBus, 'subscribe' | 'once' | 'emit' | 'off'>;

// Set by useEventBus() (tests): the bus every call is routed to instead.
let delegate: EventBusApi | null = null;

// One subscription; `once` ones are removed on their first call (`fired` set).
type Handler = { callback: (data: any) => void; once: boolean; fired?: boolean };

export class EventBus extends Service<EventBus> {
  // In subscription order, per event.
  #handlers: Partial<Record<Nutin.EventKey, Handler[]>> = {};

  constructor() {
    super();
    this.registerCleanup(this.cleanupEventListeners);
  }

  public subscribe<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void
  ): void {
    if (delegate && delegate !== this) return delegate.subscribe(event, callback);
    this.#addHandler(event, callback, false);
  }

  public once<K extends Nutin.EventKey>(
    event: K,
    callback: (data: Nutin.EventMap[K]) => void
  ): void {
    if (delegate && delegate !== this) return delegate.once(event, callback);
    this.#addHandler(event, callback, true);
  }

  public emit<K extends Nutin.EventKey>(event: K, ...[data]: EventArgs<K>): void {
    if (delegate && delegate !== this) return delegate.emit(event, ...([data] as EventArgs<K>));
    // A copy: handlers may subscribe or unsubscribe while the event is dispatched.
    this.#handlers[event]?.slice().forEach((handler) => {
      if (handler.once) {
        // Removed before it's called, and only this subscription: an emit of the same event from
        // inside it (or a handler after it) can't call it again, and a subscribe() of the same
        // callback stays.
        if (handler.fired) return;
        handler.fired = true;
        this.#handlers[event] = this.#handlers[event]?.filter((other) => other !== handler);
      }
      // A failing listener is reported but doesn't keep the others from receiving the event.
      try {
        handler.callback(data);
      } catch (error) {
        console.error(`Error in a "${event}" listener:`, error);
      }
    });
  }

  public off<K extends Nutin.EventKey>(
    event: K,
    callback?: (data: Nutin.EventMap[K]) => void
  ): void {
    if (delegate && delegate !== this) return delegate.off(event, callback);
    const handlers = this.#handlers[event];
    if (!handlers) return;

    if (callback) {
      this.#handlers[event] = handlers.filter((handler) => handler.callback !== callback);
    } else {
      delete this.#handlers[event];
    }
  }

  #addHandler(event: Nutin.EventKey, callback: (data: any) => void, once: boolean): void {
    (this.#handlers[event] ??= []).push({ callback, once });
  }

  // TypeScript-private rather than #private: tests call it to reset the shared bus.
  private cleanupEventListeners = (): void => {
    this.#handlers = {};
  };
}

export const AppEventBus = /* @__PURE__ */ EventBus.getInstance();

/**
 * For tests: routes every subscribe/once/emit/off made through AppEventBus to `bus`.
 * That covers components' `listen()`, the Navigation and Lifecycle facades, the router, i18n and app services alike.
 * Pass null to restore the real bus.
 * A subscription stays on the bus it was made on: set it before mounting, restore after destroying.
 */
export function useEventBus(bus: EventBusApi | null): void {
  delegate = bus;
}
