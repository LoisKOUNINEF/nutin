import { Service } from "../../index.js";

export type IEventBus = InstanceType<typeof EventBus>;

type Subscription<K extends EventKey = EventKey> = {
  event: K;
  callback: (data: EventMap[K]) => void;
  once?: boolean;
};

export class EventBus extends Service<EventBus> {
  private _subscriptions: Subscription[] = [];

  constructor() {
    super();
    this.registerCleanup(this.cleanupEventListeners);
  }

  private handlers: {
    [K in EventKey]?: Array<(data: EventMap[K]) => void>;
  } = {};

  public subscribe<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    this.addHandler(event, callback, false);
  }

  public once<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void
  ): void {
    this.addHandler(event, callback, true);
  }

  public emit<K extends EventKey>(event: K, data?: EventMap[K]): void {
    const callbacks = this.handlers[event];
    if (!callbacks) return;

    callbacks.slice().forEach(callback => {
      callback(data!);

      const subIndex = this._subscriptions.findIndex(
        sub => sub.event === event && sub.callback === callback && sub.once
      );
      if (subIndex > -1) {
        this.off(event, callback);
      }
    });
  }

  public off<K extends EventKey>(
    event: K,
    callback?: (data: EventMap[K]) => void
  ): void {
    const handlers = this.handlers[event];
    if (!handlers) return;

    if (callback) {
      this.handlers[event] = handlers.filter(h => h !== callback);
    } else {
      delete this.handlers[event];
    }

    this._subscriptions = this._subscriptions.filter(
      sub => sub.event !== event || (callback && sub.callback !== callback)
    );
  }

  private addHandler<K extends EventKey>(
    event: K,
    callback: (data: EventMap[K]) => void,
    once: boolean
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(callback);
    this._subscriptions.push({ event, callback, once });
  }

  private cleanupEventListeners = (): void => {
    this._subscriptions.forEach(({ event, callback }) => {
      this.off(event, callback);
    });
    this._subscriptions = [];
  };
}

export const AppEventBus = EventBus.getInstance();
