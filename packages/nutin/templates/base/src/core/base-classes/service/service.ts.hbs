/**
 * Abstract class for implementing the Singleton pattern.
 * Supports constructor parameters for initialization.
 */
export abstract class Service<T extends Service<T>> {
  static #instances = new Map<Function, Service<any>>();
  static #instantiating = new Set<Function>();
  #cleanupCallbacks: (() => void)[] = [];

  constructor() {
    const constructor = this.constructor as new (...args: any[]) => T;

    if (!Service.#instantiating.has(constructor)) {
      // Prod bundles: a short message (class names are minified there anyway).
      throw new Error(globalThis.__NUTIN_PROD__
        ? 'Use getInstance()'
        : `${constructor.name} is a Service. Use ${constructor.name}.getInstance() instead.`);
    }
    this.#autoBindMethods();
  }

  /**
   * Returns the singleton instance, creating it with the provided args if it
   * doesn't exist yet. Throws if args are passed to an already-initialized instance,
   * preventing silent re-initialization mismatches.
   */
  public static getInstance<C extends new (...args: any) => Service<any>>(
    this: C,
    ...args: ConstructorParameters<C> | []
  ): InstanceType<C> {
    const alreadyExists = Service.#instances.has(this);

    if (alreadyExists && args.length > 0) {
      throw new Error(globalThis.__NUTIN_PROD__
        ? 'Already initialized'
        : `${this.name} is already initialized: call getInstance() without arguments.`);
    }

    if (!alreadyExists) {
      Service.#instantiating.add(this);
      Service.#instances.set(this, new this(...args));
      Service.#instantiating.delete(this);
    }

    return Service.#instances.get(this) as InstanceType<C>;
  }

  public static hasInstance<T extends Service<T>>(
    constructor: new (...args: any[]) => T
  ): boolean {
    return Service.#instances.has(constructor);
  }

  public static async destroy<T extends Service<T>>(
    this: new (...args: any[]) => T
  ): Promise<void> {
    const instance = Service.#instances.get(this);
    if (instance) {
      await instance.onDestroy();
      instance.#runCleanup();
      Service.#instances.delete(this);
    }
  }

  // No page-unload hook: the browser frees everything on unload, and tearing down on
  // `beforeunload` left a page restored from the back/forward cache (or kept after a
  // cancelled "Leave site?" prompt) with every service already disposed.
  public dispose = (): void => {
    this.#runCleanup();
    Service.#instances.delete(this.constructor);
  };

  public static async destroyAll(): Promise<void> {
    const instances = Array.from(Service.#instances.values());

    await Promise.all(instances.map(instance => instance.onDestroy()));
    instances.forEach(instance => instance.#runCleanup());
    Service.#instances.clear();
    Service.#instantiating.clear();
  }

  protected registerCleanup(callback: () => void): void {
    this.#cleanupCallbacks.push(callback);
  }

  #runCleanup(): void {
    const callbacks = this.#cleanupCallbacks;
    this.#cleanupCallbacks = [];
    callbacks.forEach(fn => fn());
  }

  /**
   * For async and custom cleanup operations.
   */
  protected onDestroy(): void {}

  #autoBindMethods(): void {
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
    Service.#instances.delete(this);
  }

  /**
   * Resets all Service instances without cleanup.
   */
  public static testingResetAll(): void {
    Service.#instances.clear();
    Service.#instantiating.clear();
  }
}
