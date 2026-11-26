import type { View } from '../../base-classes/view/view.js';
import { Service } from '../../base-classes/service/service.js';
import { Navigation } from '../event-bus/navigation.facade.js';
import { AppEventBus } from '../event-bus/event-bus.js';
import { I18nService } from '../i18n/i18n.js';
import * as RouteGuardsManager from './helpers/route-guard-manager.helper.js';
import type { GuardResult } from './helpers/route-guard-manager.helper.js';
import * as ViewRenderManager from './helpers/view-render-manager.helper.js';
import * as NavigationManager from './helpers/navigation-manager.helper.js';
import type { HistoryMode } from './helpers/navigation-manager.helper.js';
import { CONFIG } from '../../config.js';

// centralized export
export * as NavigationManager from './helpers/navigation-manager.helper.js';

function currentPathAndQuery(): string {
  return window.location.pathname + window.location.search;
}

class Router extends Service<Router> {
  #currentView: View | null = null;
  #currentParams: Record<string, string> = {};
  #currentQuery: Record<string, string> = {};
  #onPopState = () => this.#handlePopState();
  #onUnhandledRejection = (event: PromiseRejectionEvent) => this.#handleUnhandledRejection(event);
  #onNavigate = (data: { path: string }) => this.navigate(data.path);
  #onReload = () => this.reload();
  #busSubscriptions: Array<() => void> = [];
  // Bumped by every navigation: one whose guards resolve after a newer navigation started
  // is dropped instead of rendering over it.
  #navId = 0;
  // False until the first view is rendered: the first load leaves focus to the browser.
  #hasRendered = false;
  // Path and query string of the URL the current view was rendered for (after its onEnter()
  // rewrites): a popstate back to it, with only the hash changed, has nothing to render.
  #renderedUrl: string | null = null;

  #routes: Nutin.Routes;

  constructor(routes: Nutin.Routes) {
    super();
    this.#routes = routes;
    this.#initializeEventListeners();
    // The first load never adds a history entry: a URL the router rewrites (a trailing slash,
    // a missing locale prefix) replaces the one the browser opened.
    this.#navigateWithMode(this.#currentLocation(), 'replace', false);
    this.registerCleanup(this.removeEventListeners);
  }

  public removeEventListeners(): void {
    this.#busSubscriptions.forEach((callback) => {
      callback();
    });
    this.#busSubscriptions = [];
    window.removeEventListener('popstate', this.#onPopState);
    window.removeEventListener('unhandledrejection', this.#onUnhandledRejection);
  }

  // Re-renders the current page, so focus isn't moved (see focusView()).
  public async reload(): Promise<void> {
    await this.#navigateWithMode(this.#currentLocation(), 'none', false);
  }

  public async navigate(path: string | '', pushState: boolean = true): Promise<void> {
    await this.#navigateWithMode(path, pushState ? 'push' : 'none', this.#hasRendered);
  }

  public getCurrentParams(): Record<string, string> {
    return { ...this.#currentParams };
  }

  public getParam(key: string): string | undefined {
    return this.#currentParams[key];
  }

  // The URL's query string, parsed: a repeated key keeps its last value.
  public getQueryParams(): Record<string, string> {
    return { ...this.#currentQuery };
  }

  public getQueryParam(key: string): string | undefined {
    return this.#currentQuery[key];
  }

  // Path, query and hash of the current URL, as navigate() takes them.
  #currentLocation(): string {
    return NavigationManager.getCurrentPath() + window.location.search + window.location.hash;
  }

  async #navigateWithMode(path: string, mode: HistoryMode, moveFocus: boolean): Promise<void> {
    const navId = ++this.#navId;
    const isStale = () => navId !== this.#navId;
    const [pathAndQuery = '', hash] = path.split('#');
    const [rawPath = '', query] = pathAndQuery.split('?');
    const search = query ? `?${query}` : '';
    const queryParams = parseQuery(query);
    const normalizedPath = NavigationManager.normalizePath(rawPath);
    const currentPath = NavigationManager.getCurrentPath();

    // Try to match the route with parameters
    const routeMatch = this.#matchRoute(normalizedPath);

    if (!routeMatch) {
      await this.#handleNotFound(normalizedPath, mode, isStale, moveFocus, search, hash);
      return;
    }

    const guardResult = await this.#handleGuards(
      normalizedPath,
      routeMatch.route,
      routeMatch.params,
      queryParams,
      currentPath,
      mode,
      moveFocus,
      isStale,
      search,
      hash
    );

    if (!guardResult || isStale()) return;

    // Before the current view is torn down: it stays up while a lazy route's chunk loads.
    const view = await this.#resolveView(guardResult.viewConstructor!, NavigationManager.localizedUrl(normalizedPath, search, hash), isStale);
    if (!view) return;

    this.#currentView = await ViewRenderManager.transitionOutCurrentView(this.#currentView);
    this.#currentParams = routeMatch.params;
    this.#currentQuery = queryParams;

    // Must run before renderNewView(): a view's onEnter() may rewrite the URL via NavigationManager.replaceState(), 
    // which acts on whatever history entry is current. This ensures current before onEnter() fires.
    NavigationManager.updateHistory(normalizedPath, mode, hash, search);

    this.#currentView = ViewRenderManager.renderNewView(view, routeMatch.params, this.#currentQuery);

    NavigationManager.updateDocumentTitle(this.#currentView, routeMatch.pattern);
    NavigationManager.setNoIndex(false);
    NavigationManager.scrollToHash(hash);
    this.#afterRender(moveFocus);
  }

  // Runs a route's view factory. A sync one behaves as it always did (its errors propagate).
  // A lazy one is awaited: if it fails to load, recoverFromFailedViewLoad() takes over; if a
  // newer navigation started meanwhile, the view (already mounted, empty, by its
  // constructor) is destroyed and dropped.
  async #resolveView(factory: Nutin.ViewFactory, url: string, isStale: () => boolean): Promise<View | null> {
    if (isStale()) return null;
    const result = factory();
    if (!isPromise(result)) return result;

    let view: View;
    try {
      view = await result;
    } catch (error) {
      if (!isStale()) NavigationManager.recoverFromFailedViewLoad(url, error);
      return null;
    }
    if (isStale()) {
      view.destroy();
      return null;
    }
    return view;
  }

  // After updateDocumentTitle(): focusView() announces document.title when the view has no h1.
  #afterRender(moveFocus: boolean): void {
    if (moveFocus && this.#currentView) NavigationManager.focusView(this.#currentView);
    this.#hasRendered = true;
    this.#renderedUrl = currentPathAndQuery();
  }

  #initializeEventListeners(): void {
    this.#initializeNavigationEvents();
    this.#initializeI18nEvents();
  }

  #initializeNavigationEvents(): void {
    window.addEventListener('popstate', this.#onPopState);
    window.addEventListener('unhandledrejection', this.#onUnhandledRejection);
    const unsubOnNav = Navigation.onNavigate(this.#onNavigate);
    const unsubOnReload = Navigation.onReload(this.#onReload);
    this.#busSubscriptions.push(unsubOnNav, unsubOnReload); 
  }

  #initializeI18nEvents(): void {
    // The view stays, under its new locale's URL.
    const onLangChanged = () => {
      NavigationManager.updateLocaleInUrl();
      if (this.#renderedUrl !== null) this.#renderedUrl = currentPathAndQuery();
    };
    AppEventBus.subscribe('language-changed', onLangChanged);
    const unsubOnLang = () => AppEventBus.off('language-changed', onLangChanged);
    this.#busSubscriptions.push(unsubOnLang);    
  }

  // An import() the app doesn't catch (a component's lazy module), failing because its file is
  // gone: the same recovery as a lazy route, a full page load of the current URL, once. A caught
  // import() error is the app's to handle; the error still reaches the console either way.
  #handleUnhandledRejection(event: PromiseRejectionEvent): void {
    if (!NavigationManager.isModuleLoadError(event.reason)) return;
    const { pathname, search, hash } = window.location;
    NavigationManager.reloadOnce(pathname + search + hash, event.reason, 'a module');
  }

  async #handlePopState(): Promise<void> {
    // Back/forward across a same-page link: only the hash changed, and the view is already this
    // URL's. Left to the browser, as without a router: it restores the scroll position, and the
    // view isn't rebuilt (focus stays, no re-render cost).
    if (this.#currentView && currentPathAndQuery() === this.#renderedUrl) return;
    if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
      const newLocale = NavigationManager.getCurrentLocale();
      if (newLocale && newLocale !== I18nService.currentLanguage) {
        await I18nService.setCurrentLanguage(newLocale as Nutin.Language);
      }
    }
    this.#navigateWithMode(this.#currentLocation(), 'none', this.#hasRendered);
  }

  /**
   * Match a path against route patterns, supporting optional parameters
   * Examples:
   * - '/users/:id?' matches '/users' and '/users/123'
   * - '/posts/:id' matches '/posts/123' but not '/posts'
   */
  #matchRoute(path: string): Nutin.RouteMatch | null {
    for (const [pattern, routeConfig] of Object.entries(this.#routes)) {
      const match = NavigationManager.matchPattern(pattern, path);
      if (match) {
        return { route: routeConfig, params: match, pattern };
      }
    }
    return null;
  }

  // The 404 view renders at the URL that was asked for (query and hash included): the user can
  // see and fix it, and Back returns to the previous page.
  async #handleNotFound(
    normalizedPath: string,
    mode: HistoryMode,
    isStale: () => boolean,
    moveFocus: boolean,
    search: string = '',
    hash?: string
  ): Promise<void> {
    const notFoundRoute = this.#routes['/404'];

    if (!notFoundRoute) {
      console.error(`[router] No route matches "${normalizedPath}" and there is no '/404' route — add one to appRoutes.`);
      return;
    }

    const notFoundFactory = RouteGuardsManager.getViewConstructor(notFoundRoute);
    const view = await this.#resolveView(notFoundFactory, NavigationManager.localizedUrl(normalizedPath, search, hash), isStale);
    if (!view) return;

    this.#currentView = await ViewRenderManager.transitionOutCurrentView(this.#currentView);
    this.#currentParams = {};
    this.#currentQuery = {};
    // Before renderNewView(), as for a matched route: onEnter() acts on the current entry.
    NavigationManager.updateHistory(normalizedPath, mode, hash, search);
    this.#currentView = ViewRenderManager.renderNewView(view, {});

    NavigationManager.updateDocumentTitle(this.#currentView, '/404');
    NavigationManager.setNoIndex(true);
    NavigationManager.scrollToHash(hash);
    this.#afterRender(moveFocus);
  }

  async #handleGuards(
    normalizedPath: string,
    routeConfig: Nutin.RouteConfig,
    params: Record<string, string>,
    query: Record<string, string>,
    currentPath: string,
    mode: HistoryMode,
    moveFocus: boolean,
    isStale: () => boolean,
    search: string,
    hash?: string
  ): Promise<GuardResult | false> {
    const guardResult = await RouteGuardsManager.processRouteGuards(routeConfig, params, query);

    if (!guardResult.allowed) {
      if (guardResult.redirectTo && NavigationManager.normalizePath(guardResult.redirectTo) === '/404') {
        // Not a redirect: the 404 view renders at the URL that was asked for, as for one that
        // matches no route.
        await this.#handleNotFound(normalizedPath, mode, isStale, moveFocus, search, hash);
      } else if (guardResult.redirectTo) {
        // A guarded URL that's already the current history entry (back/forward,
        // reload, first load) is replaced by the redirect target, so the address
        // bar matches what's rendered and Back doesn't land on the guarded URL again.
        const redirectMode = mode === 'push' && normalizedPath !== currentPath ? 'push' : 'replace';
        await this.#navigateWithMode(guardResult.redirectTo, redirectMode, moveFocus);
      }
      // If no redirect, stay on current route (guard blocked navigation)
      return false;
    }

    return guardResult;
  }
}

function parseQuery(query: string = ''): Record<string, string> {
  const params: Record<string, string> = {};
  new URLSearchParams(query).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T> | null)?.then === 'function';
}

export const AppRouter = (routes: Nutin.Routes) => Router.getInstance(routes);
