/**
 * Abstract  class for implementing the Singleton pattern.
 * Supports constructor parameters for initialization.
 */
export abstract class Service<T extends Service<T>> {
  private static _instances = new Map<Function, any>();
  private static _instantiating = new Set<Function>();
  private _cleanupCallbacks: (() => void)[] = [];
  
  constructor(...args: any[]) {
    const constructor = this.constructor as new (...args: any[]) => T;
    
    if (!Service._instantiating.has(constructor)) {
      throw new Error(
        `${constructor.name} is a Service. Use ${constructor.name}.getInstance() instead.`
      );
    }
    this.autoBindMethods();
    window.addEventListener('beforeunload', this.dispose);
  }

  public static createInstance<T extends Service<T>>(
    constructor: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    if (!Service._instances.has(constructor)) {
      Service._instantiating.add(constructor);
      Service._instances.set(constructor, new constructor(...args));
      Service._instantiating.delete(constructor);
    }
    return Service._instances.get(constructor);
  }

  public static getInstance<T extends Service<T>>(this: new () => T): T {
    if (!Service._instances.has(this)) {
      Service._instantiating.add(this);
      Service._instances.set(this, new this());
      Service._instantiating.delete(this);
    }
    return Service._instances.get(this);
  }

  public static hasInstance<T extends Service<T>>(
    constructor: new (...args: any[]) => T
  ): boolean {
    return Service._instances.has(constructor);  
  }

  public static async destroy<T extends Service<T>>(
    this: new (...args: any[]) => T
  ): Promise<void> {
    const instance = Service._instances.get(this);
    if (instance) {
      await instance.onDestroy();
      Service._instances.delete(this);
    }
  }

  public dispose = (): void => {
    this._cleanupCallbacks.forEach(fn => fn());
    this._cleanupCallbacks = [];
    Service._instances.delete(this.constructor);
  };

  public static async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(Service._instances.values())
      .map(instance => instance.onDestroy());
    
    await Promise.all(destroyPromises);
    Service._instances.clear();
    Service._instantiating.clear();
  }

  protected registerCleanup(callback: () => void): void {
    this._cleanupCallbacks.push(callback);
  }

  /**
   * For async and custom cleanup operations
   */
  protected onDestroy<T extends Service<T>>(this: () => T): void {
    console.log(`No onDestroy operations.`)
  }

  private autoBindMethods(): void {
    let proto = Object.getPrototypeOf(this);

    while (proto && proto !== Service.prototype) {
      const propertyNames = Object.getOwnPropertyNames(proto);

      for (const key of propertyNames) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);

        if (
          key !== 'constructor' &&
          descriptor &&
          typeof descriptor.value === 'function'
        ) {
          (this as any)[key] = descriptor.value.bind(this);
        }
      }

      proto = Object.getPrototypeOf(proto);
    }
  }

  /**
   * Resets the Service instance without cleanup.
   */
  public static testingReset<T extends Service<T>>(
    this: new (...args: any[]) => T
  ): void {
    Service._instances.delete(this);
  }

  /**
   * Resets all Service instances without cleanup.
   */
  public static testingResetAll(): void {
    Service._instances.clear();
    Service._instantiating.clear();
  }
}
