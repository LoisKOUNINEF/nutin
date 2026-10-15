// Nutin's public types, all inside the global `Nutin` namespace so they can't collide with other packages' globals.
// No import needed: the app extends it in src/app/globals.d.ts.
// This file must stay free of top-level import/export, so runtime classes go through import().
declare namespace Nutin {
  interface RouterEventMap {
    'navigate': { path: string };
    'reload': undefined;
  }

  interface LifecycleEventMap {
    'before-render': undefined;
    'after-render': undefined;
    'before-destroy': undefined;
    'after-destroy': undefined;
    'view-mount': { viewName: string };
    'view-unmount': { viewName: string };
  }

  interface I18nEventMap {
    'language-changed': {
      lang: string;
    };
  }

  interface FrameworkEventMap extends RouterEventMap, LifecycleEventMap, I18nEventMap {}

  interface AppEventMap {}

  interface EventMap extends FrameworkEventMap, AppEventMap {}

  type EventKey = keyof EventMap;

  type Subscription<K extends EventKey = EventKey> = {
    event: K;
    callback: (data: EventMap[K]) => void;
    once?: boolean;
  };

  // Components

  type Template = string | import('./index.js').SafeHtml;

  type TrustLevel = 'strict' | 'normal' | 'trusted';

  interface ComponentConfig {
    selector: string;
    factory: (element: HTMLElement) => import('./index.js').Component;
    // Same keep value on the next render: the child is kept as-is instead of recreated
    keep?: string | number;
  }

  interface BaseComponentOptions {
    template?: Template;
    mountTarget?: string | HTMLElement;
    tagName?: keyof HTMLElementTagNameMap;
    trustLevel?: TrustLevel;
  }

  interface ComponentProps {
    // Common HTML attributes - extend as needed
    className?: string;
    style?: string;
    textContent?: string;

    // Form field bindings - extend as needed
    name?: string;
    email?: string;

    // Allow for additional data-bind attributes
    [key: string]: any;
  }

  interface ComponentOptions<K = any> extends BaseComponentOptions {
    props?: ComponentProps;
    config?: K;
    defaults?: Partial<K>;
    templateFn?: (config?: K) => Template;
    normalizeKeys?: (keyof K)[];
  }

  interface ViewOptions extends BaseComponentOptions {
    viewName: string;
  }

  interface CatalogConfig extends ComponentOptions {
    items: CatalogItemConfig[];
    elementName: string;
    elementTag?: keyof HTMLElementTagNameMap;
    selector: string;
    component: new (el: HTMLElement, data: any, props?: any) => import('./index.js').Component;
    // Same value on the next render keeps an unchanged item as-is; changed items are recreated
    keepBy?: (item: any, index: number) => string | number;
  }

  interface CatalogItemBase {
    index: number;
  }

  type CatalogItemObject<T extends object> = T & CatalogItemBase;

  interface CatalogItemPrimitive extends CatalogItemBase {
    value: string | number | boolean | null | undefined;
  }

  type CatalogItemConfig<T = any> =
    T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;

  // Router

  /**
   * Route guard function that receives route parameters and returns:
   * - true to allow navigation
   * - false to block it
   * - string to redirect to a different route
   */
  type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;

  /**
   * Creates a route's view. Returning a Promise makes the route lazy: e.g.
   * `() => import('./views/about/about.view.js').then((m) => new m.AboutView())`
   * puts the view's code in its own chunk, loaded on the first visit.
   */
  type ViewFactory = () => import('./index.js').View | Promise<import('./index.js').View>;

  /**
   * Route configuration - can be just a view factory or an object with guards
   */
  type RouteConfig = ViewFactory | {
    view: ViewFactory;
    guards?: RouteGuard[];
  };

  type Routes = Record<string, RouteConfig>;

  interface RouteMatch {
    route: RouteConfig;
    params: Record<string, string>;
    pattern: string;
  }

  // Instance types of the framework services
  type Router = ReturnType<typeof import('./index.js').AppRouter>;
  type EventBus = InstanceType<typeof import('./index.js').EventBus>;
  type HttpClient = InstanceType<typeof import('./index.js').HttpClient>;

  // HTTP

  type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  type QueryValue = string | number | boolean | null | undefined;

  /**
   * headers?: Record<string, string>;
   * queryParams?: Record<string, QueryValue | QueryValue[]>;
   * timeout?: number;
   * signal?: AbortSignal;
   * credentials? / cache? / referrerPolicy? / redirect?: passed to fetch as-is.
   */
  interface RequestConfig {
    headers?: Record<string, string>;
    queryParams?: Record<string, QueryValue | QueryValue[]>;
    timeout?: number;
    signal?: AbortSignal;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    referrerPolicy?: ReferrerPolicy;
    redirect?: RequestRedirect;
  }

  interface HttpClientOptions {
    // URL prefixes (origin + path) whose paths may contain encoded "/" or "\" (%2F, %5C).
    trustedAPIs?: string[];
  }

  // i18n & pipes

  type Language = typeof import('./services/i18n/languages.js').LANGUAGES[number];
  type Translations = Record<string, any>;

  type PipeFunction = (value: any, ...args: any[]) => string;

  // Globals

  interface GlobalMountable {
    render(): HTMLElement;
    destroy?(): void;
  }

  interface GlobalConfig<T extends GlobalMountable = GlobalMountable> {
    /** The component's own class — constructed internally as `new component(mountTarget)`. */
    component: new (mountTarget: HTMLElement) => T;
    /** Stamped onto the mounted root element; pass this same id to `hideGlobals`/`revealGlobals`. */
    id: string;
  }

  interface RegisterGlobalsOptions {
    /** Rendered and prepended to `<body>`, in the given order (e.g. a header). */
    before?: GlobalConfig[];
    /** Rendered and appended to `<body>`, in the given order (e.g. a footer). */
    after?: GlobalConfig[];
  }
}

// Set by the builder's esbuild `define` so prod bundles can drop i18n code when it's
// disabled; undefined in tests and tsc output, which fall back to CONFIG.i18n.
declare var __NUTIN_I18N__: boolean | undefined;
