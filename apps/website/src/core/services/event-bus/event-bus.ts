import { Service } from "../../index.js";

/**
  IEventBus is a type alias for the instance of EventBus, not a true interface 
*/
export type IEventBus = InstanceType<typeof EventBus>;

export class EventBus extends Service<EventBus> {
  private _subscriptions: EventKey[] = [];
  
  constructor() {
    super();
    this.registerCleanup(this.cleanupEventListeners);
  }

  private handlers: {
    [K in EventKey]?: Array<(data: EventMap[K]) => void>
  } = {};
  
  public subscribe<K extends EventKey>(event: K, callback: (data: EventMap[K]) => void): void {
    AppEventBus.on(event, callback);
    this._subscriptions.push(event);
  }

  private on<K extends EventKey>(event: K, callback: (data: EventMap[K]) => void): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(callback);
  }

  public emit<K extends EventKey>(event: K, data: EventMap[K]): void;
  public emit<K extends EventKey>(event: K): void;
  public emit<K extends EventKey>(event: K, data?: EventMap[K]): void {
    this._subscriptions.push(event);
    const callbacks = this.handlers[event];
    if (callbacks) {
      callbacks.forEach(callback => callback(data!));
    }
  }

  public off<K extends EventKey>(event: K, callback: (data: EventMap[K]) => void): void {
    const handlers = this.handlers[event];
    if (!handlers) return;

    this.handlers[event] = handlers.filter(handler => 
      handler !== callback
    ) as typeof handlers;
  }

  private cleanupEventListeners = () => {
    this._subscriptions.forEach(event => {
      AppEventBus.off(event, () => {});
    });
    this._subscriptions = [];
  };

  onDestroy<T extends Service<T>>(this: () => T): void {
    
  }
}

export const AppEventBus = EventBus.getInstance();
