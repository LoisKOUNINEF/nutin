// Not "NavigationEventMap": that global already exists in lib.dom (Navigation API) and
// would merge with this one, giving 'navigate' two conflicting payload types.
declare interface RouterEventMap {
  'navigate': { path: string };
  'reload': undefined;
}

declare interface LifecycleEventMap {
  'before-render': undefined;
  'after-render': undefined;
  'before-destroy': undefined;
  'after-destroy': undefined;
  'view-mount': { viewName: string };
  'view-unmount': { viewName: string };
}

declare interface I18nEventMap {
  'language-changed': {
    lang: string;
  };
}

declare interface FrameworkEventMap extends RouterEventMap, LifecycleEventMap, I18nEventMap {}

declare interface AppEventMap {}

declare interface EventMap extends FrameworkEventMap, AppEventMap {}

declare type EventKey = keyof EventMap;

declare type Subscription<K extends EventKey = EventKey> = {
  event: K;
  callback: (data: EventMap[K]) => void;
  once?: boolean;
};

// This file must stay free of top-level import/export, so runtime classes go through import().

// Components

declare type Template = string | import('./index.js').SafeHtml;

declare type TrustLevel = 'strict' | 'normal' | 'trusted';

declare interface ComponentConfig {
  selector: string;
  factory: (element: HTMLElement) => import('./index.js').Component;
  // Same key on the next render: the child is kept as-is instead of recreated
  key?: string | number;
}

declare interface BaseComponentOptions {
  template?: Template;
  mountTarget?: string | HTMLElement;
  tagName?: keyof HTMLElementTagNameMap;
  trustLevel?: TrustLevel;
}

declare interface ComponentProps {
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

declare interface ComponentOptions<K = any> extends BaseComponentOptions {
  props?: ComponentProps;
  config?: K;
  defaults?: Partial<K>;
  templateFn?: (config?: K) => Template;
  normalizeKeys?: (keyof K)[];
}

declare interface ViewOptions extends BaseComponentOptions {
  viewName: string;
}

declare interface CatalogConfig extends ComponentOptions {
  items: CatalogItemConfig[];
  elementName: string;
  elementTag?: keyof HTMLElementTagNameMap;
  selector: string;
  component: new (el: HTMLElement, data: any, props?: any) => import('./index.js').Component;
  trackBy?: (item: any, index: number) => string | number;
}

declare interface CatalogItemBase {
  index: number;
}

declare type CatalogItemObject<T extends object> = T & CatalogItemBase;

declare interface CatalogItemPrimitive extends CatalogItemBase {
  value: string | number | boolean | null | undefined;
}

declare type CatalogItemConfig<T = any> =
  T extends object ? CatalogItemObject<T> : CatalogItemPrimitive;

// Router

/**
 * Route guard function that receives route parameters and returns:
 * - true to allow navigation
 * - false to block it
 * - string to redirect to a different route
 */
declare type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;

/**
 * Creates a route's view. Returning a Promise makes the route lazy: e.g.
 * `() => import('./views/about/about.view.js').then((m) => new m.AboutView())`
 * puts the view's code in its own chunk, loaded on the first visit.
 */
declare type ViewFactory = () => import('./index.js').View | Promise<import('./index.js').View>;

/**
 * Route configuration - can be just a view factory or an object with guards
 */
declare type RouteConfig = ViewFactory | {
  view: ViewFactory;
  guards?: RouteGuard[];
};

declare type Routes = Record<string, RouteConfig>;

declare interface RouteMatch {
  route: RouteConfig;
  params: Record<string, string>;
  pattern: string;
}

// Instance types of the framework services, not true interfaces
declare type IRouter = ReturnType<typeof import('./index.js').AppRouter>;
declare type IEventBus = InstanceType<typeof import('./index.js').EventBus>;
declare type IHttpClient = InstanceType<typeof import('./index.js').HttpClient>;

// HTTP

declare type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

declare type QueryValue = string | number | boolean | null | undefined;

/**
 * headers?: Record<string, string>;
 * queryParams?: Record<string, QueryValue | QueryValue[]>;
 * timeout?: number;
 * signal?: AbortSignal;
 * credentials? / cache? / referrerPolicy? / redirect?: passed to fetch as-is.
 */
declare interface IRequestConfig {
  headers?: Record<string, string>;
  queryParams?: Record<string, QueryValue | QueryValue[]>;
  timeout?: number;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  referrerPolicy?: ReferrerPolicy;
  redirect?: RequestRedirect;
}

declare interface IHttpClientOptions {
  // URL prefixes (origin + path) whose paths may contain encoded "/" or "\" (%2F, %5C).
  trustedAPIs?: string[];
}

// i18n & pipes

declare type Language = typeof import('./services/i18n/languages.js').LANGUAGES[number];
declare type Translations = Record<string, any>;

declare type PipeFunction = (value: any, ...args: any[]) => string;

// Globals

declare interface GlobalMountable {
  render(): HTMLElement;
  destroy?(): void;
}

declare interface GlobalConfig<T extends GlobalMountable = GlobalMountable> {
  /** The component's own class — constructed internally as `new component(mountTarget)`. */
  component: new (mountTarget: HTMLElement) => T;
  /** Stamped onto the mounted root element; pass this same id to `hideGlobals`/`revealGlobals`. */
  id: string;
}

declare interface RegisterGlobalsOptions {
  /** Rendered and prepended to `<body>`, in the given order (e.g. a header). */
  before?: GlobalConfig[];
  /** Rendered and appended to `<body>`, in the given order (e.g. a footer). */
  after?: GlobalConfig[];
}

// Set by the builder's esbuild `define` so prod bundles can drop i18n code when it's
// disabled; undefined in tests and tsc output, which fall back to CONFIG.i18n.
declare var __NUTIN_I18N__: boolean | undefined;
