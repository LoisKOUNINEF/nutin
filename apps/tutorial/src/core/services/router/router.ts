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

class Router extends Service<Router> {
  private _currentView: View | null = null;
  private _currentParams: Record<string, string> = {};
  private onPopState = () => this.handlePopState();
  private onNavigate = (data: { path: string }) => this.navigate(data.path);
  private onReload = () => this.reload();
  private _busSubscriptions: Array<() => void> = [];
  // Bumped by every navigation: one whose guards resolve after a newer navigation started
  // is dropped instead of rendering over it.
  private _navId = 0;
  // False until the first view is rendered: the first load leaves focus to the browser.
  private _hasRendered = false;

  constructor(private routes: Routes) {
    super();
    this.initializeEventListeners();
    this.navigate(this.currentLocation());
    this.registerCleanup(this.removeEventListeners);
  }

  public removeEventListeners(): void {
    this._busSubscriptions.forEach((callback) => {
      callback();
    });
    this._busSubscriptions = [];
    window.removeEventListener('popstate', this.onPopState);
  }

  // Re-renders the current page, so focus isn't moved (see focusView()).
  public async reload(): Promise<void> {
    await this.navigateWithMode(this.currentLocation(), 'none', false);
  }

  public async navigate(path: string | '', pushState: boolean = true): Promise<void> {
    await this.navigateWithMode(path, pushState ? 'push' : 'none', this._hasRendered);
  }

  public getCurrentParams(): Record<string, string> {
    return { ...this._currentParams };
  }

  public getParam(key: string): string | undefined {
    return this._currentParams[key];
  }

  // Path, query and hash of the current URL, as navigate() takes them.
  private currentLocation(): string {
    return NavigationManager.getCurrentPath() + window.location.search + window.location.hash;
  }

  private async navigateWithMode(path: string, mode: HistoryMode, moveFocus: boolean): Promise<void> {
    const navId = ++this._navId;
    const isStale = () => navId !== this._navId;
    const [pathAndQuery = '', hash] = path.split('#');
    const [rawPath = '', query] = pathAndQuery.split('?');
    const search = query ? `?${query}` : '';
    const normalizedPath = NavigationManager.normalizePath(rawPath);
    const currentPath = NavigationManager.getCurrentPath();

    // Try to match the route with parameters
    const routeMatch = this.matchRoute(normalizedPath);

    if (!routeMatch) {
      await this.handleNotFound(normalizedPath, currentPath, mode, isStale, moveFocus);
      return;
    }

    const guardResult = await this.handleGuards(
      normalizedPath,
      routeMatch.route,
      routeMatch.params,
      currentPath,
      mode,
      moveFocus
    );

    if (!guardResult || isStale()) return;

    // Before the current view is torn down: it stays up while a lazy route's chunk loads.
    const view = await this.resolveView(guardResult.viewConstructor!, NavigationManager.localizedUrl(normalizedPath, search, hash), isStale);
    if (!view) return;

    this._currentView = await ViewRenderManager.transitionOutCurrentView(this._currentView);
    this._currentParams = routeMatch.params;

    // Must run before renderNewView(): a view's onEnter() may rewrite the URL via
    // NavigationManager.replaceState (e.g. canonicalizing a bare route to a default
    // sub-page), which acts on whatever history entry is current — so that entry needs
    // to already be this route's, not the previous view's, before onEnter() fires.
    NavigationManager.updateHistory(normalizedPath, currentPath, mode, hash, search);

    this._currentView = ViewRenderManager.renderNewView(view, routeMatch.params);

    NavigationManager.updateDocumentTitle(this._currentView, routeMatch.pattern);
    NavigationManager.scrollToHash(hash);
    this.afterRender(moveFocus);
  }

  // Runs a route's view factory. A sync one behaves as it always did (its errors propagate).
  // A lazy one is awaited: if it fails to load, recoverFromFailedViewLoad() takes over; if a
  // newer navigation started meanwhile, the view (already mounted, empty, by its
  // constructor) is destroyed and dropped.
  private async resolveView(factory: ViewFactory, url: string, isStale: () => boolean): Promise<View | null> {
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
  private afterRender(moveFocus: boolean): void {
    if (moveFocus && this._currentView) NavigationManager.focusView(this._currentView);
    this._hasRendered = true;
  }

  private initializeEventListeners(): void {
    this.initializeNavigationEvents();
    this.initializeI18nEvents();
  }

  private initializeNavigationEvents(): void {
    window.addEventListener('popstate', this.onPopState);
    const unsubOnNav = Navigation.onNavigate(this.onNavigate);
    const unsubOnReload = Navigation.onReload(this.onReload);
    this._busSubscriptions.push(unsubOnNav, unsubOnReload); 
  }

  private initializeI18nEvents(): void {
    const onLangChanged = () => NavigationManager.updateLocaleInUrl();
    AppEventBus.subscribe('language-changed', onLangChanged);
    const unsubOnLang = () => AppEventBus.off('language-changed', onLangChanged);
    this._busSubscriptions.push(unsubOnLang);    
  }

  private async handlePopState(): Promise<void> {
    if (globalThis.__NUTIN_I18N__ ?? CONFIG.i18n) {
      const newLocale = NavigationManager.getCurrentLocale();
      if (newLocale && newLocale !== I18nService.currentLanguage) {
        await I18nService.setCurrentLanguage(newLocale as Language);
      }
    }
    this.navigateWithMode(this.currentLocation(), 'none', this._hasRendered);
  }

  /**
   * Match a path against route patterns, supporting optional parameters
   * Examples:
   * - '/users/:id?' matches '/users' and '/users/123'
   * - '/posts/:id' matches '/posts/123' but not '/posts'
   */
  private matchRoute(path: string): RouteMatch | null {
    for (const [pattern, routeConfig] of Object.entries(this.routes)) {
      const match = NavigationManager.matchPattern(pattern, path);
      if (match) {
        return { route: routeConfig, params: match, pattern };
      }
    }
    return null;
  }

  private async handleNotFound(
    normalizedPath: string, 
    currentPath: string, 
    mode: HistoryMode,
    isStale: () => boolean,
    moveFocus: boolean
  ): Promise<void> {
    const notFoundRoute = this.routes['/404'];

    if (!notFoundRoute) {
      console.error('No 404 route defined');
      return;
    }

    const notFoundFactory = RouteGuardsManager.getViewConstructor(notFoundRoute);
    const view = await this.resolveView(notFoundFactory, NavigationManager.localizedUrl(normalizedPath), isStale);
    if (!view) return;

    this._currentView = await ViewRenderManager.transitionOutCurrentView(this._currentView);
    this._currentParams = {};
    this._currentView = ViewRenderManager.renderNewView(view, {});

    NavigationManager.updateDocumentTitle(this._currentView, '/404');
    NavigationManager.updateHistory(normalizedPath, currentPath, mode);
    this.afterRender(moveFocus);
  }

  private async handleGuards(
    normalizedPath: string,
    routeConfig: RouteConfig,
    params: Record<string, string>,
    currentPath: string,
    mode: HistoryMode,
    moveFocus: boolean
  ): Promise<GuardResult | false> {
    const guardResult = await RouteGuardsManager.processRouteGuards(
      routeConfig, 
      normalizedPath,
      params
    );

    if (!guardResult.allowed) {
      if (guardResult.redirectTo) {
        // A guarded URL that's already the current history entry (back/forward,
        // reload, first load) is replaced by the redirect target, so the address
        // bar matches what's rendered and Back doesn't land on the guarded URL again.
        const redirectMode = mode === 'push' && normalizedPath !== currentPath ? 'push' : 'replace';
        await this.navigateWithMode(guardResult.redirectTo, redirectMode, moveFocus);
      }
      // If no redirect, stay on current route (guard blocked navigation)
      return false;
    }

    return guardResult;
  }
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T> | null)?.then === 'function';
}

export const AppRouter = (routes: Routes) => Router.getInstance(routes);
