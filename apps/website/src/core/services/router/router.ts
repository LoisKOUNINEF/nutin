import { View, AppEventBus } from '../../index.js';
import { Routes, RouteConfig, RouteGuardsManager, GuardResult } from './helpers/route-guard-manager.helper.js';
import { ViewRenderManager } from './helpers/view-render-manager.helper.js';
import { NavigationManager } from './helpers/navigation-manager.helper.js';

// centralized export
export { Routes, RouteGuard } from './helpers/route-guard-manager.helper.js';
export { ViewRenderManager } from './helpers/view-render-manager.helper.js';

/**
 * IRouter is a type alias for the instance of Router, not a true interface 
 */
export type IRouter = InstanceType<typeof Router>;

export interface RouteMatch {
  route: RouteConfig;
  params: Record<string, string>;
}

class Router {
  private _currentView: View | null = null;
  private _currentParams: Record<string, string> = {};

  constructor(private routes: Routes) {
    this.initializeEventListeners();
    this.navigate(NavigationManager.getCurrentPath());
  }

  public async reload(): Promise<void> {
    const currentRoute = NavigationManager.getCurrentPath();
    await this.navigate(currentRoute, false);
  }

  public async navigate(path: string | '', pushState: boolean = true): Promise<void> {
    const normalizedPath = NavigationManager.normalizePath(path);
    const currentPath = NavigationManager.getCurrentPath();
    
    // Try to match the route with parameters
    const routeMatch = this.matchRoute(normalizedPath);

    if (!routeMatch) {
      await this.handleNotFound(normalizedPath, currentPath, pushState);
      return;
    }

    const guardResult = await this.handleGuards(
      normalizedPath, 
      routeMatch.route, 
      routeMatch.params, 
      pushState
    );
    
    if (!guardResult) return;

    this._currentView = await ViewRenderManager.transitionOutCurrentView(this._currentView);
    this._currentParams = routeMatch.params;
    this._currentView = ViewRenderManager.renderNewView(
      guardResult.viewConstructor!, 
      routeMatch.params
    );
    
    NavigationManager.updateMetaContent(this._currentView);
    NavigationManager.updateHistory(normalizedPath, currentPath, pushState);
  }

  public getCurrentParams(): Record<string, string> {
    return { ...this._currentParams };
  }

  public getParam(key: string): string | undefined {
    return this._currentParams[key];
  }

  private initializeEventListeners(): void {
    window.addEventListener('popstate', () => this.handlePopState());
    AppEventBus.subscribe('navigate', (path: string) => this.navigate(path));
    AppEventBus.subscribe('reload', () => this.reload());
  }

  private handlePopState(): void {
    this.navigate(NavigationManager.getCurrentPath(), false);
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
        return { route: routeConfig, params: match };
      }
    }
    return null;
  }

  private async handleNotFound(
    normalizedPath: string, 
    currentPath: string, 
    pushState: boolean
  ): Promise<void> {
    const notFoundRoute = this.routes['/404'];

    if (!notFoundRoute) {
      console.error('No 404 route defined');
      return;
    }

    const notFoundConstructor = RouteGuardsManager.getViewConstructor(notFoundRoute);
    
    this._currentView = await ViewRenderManager.transitionOutCurrentView(this._currentView);
    this._currentParams = {};
    this._currentView = ViewRenderManager.renderNewView(notFoundConstructor, {});
    
    NavigationManager.updateHistory(normalizedPath, currentPath, pushState);
  }

  private async handleGuards(
    normalizedPath: string,
    routeConfig: RouteConfig,
    params: Record<string, string>,
    pushState: boolean
  ): Promise<GuardResult | false> {
    const guardResult = await RouteGuardsManager.processRouteGuards(
      routeConfig, 
      normalizedPath,
      params
    );

    if (!guardResult.allowed) {
      if (guardResult.redirectTo) {
        await this.navigate(guardResult.redirectTo, pushState);
      }
      // If no redirect, stay on current route (guard blocked navigation)
      return false;
    }

    return guardResult;
  }
}

export const AppRouter = (routes: Routes) => new Router(routes);
