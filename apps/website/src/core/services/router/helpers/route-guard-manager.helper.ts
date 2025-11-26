import { View } from '../../../index.js';

/**
 * Route guard function that receives route parameters and returns:
 * - true to allow navigation
 * - false to block it
 * - string to redirect to a different route
 */
export type RouteGuard = (params: Record<string, string>) => boolean | string | Promise<boolean | string>;

export type GuardResult = {
  allowed: boolean,
  redirectTo?: string,
  viewConstructor?: () => View,
}

/**
 * Route configuration - can be just a view constructor or an object with guards
 */
export type RouteConfig = (() => View) | {
  view: () => View;
  guards?: RouteGuard[];
};

export type Routes = Record<string, RouteConfig>;

export class RouteGuardsManager {
  public static getViewConstructor(routeConfig: RouteConfig): () => View {
    return typeof routeConfig === 'function' ? routeConfig : routeConfig.view;
  }

  public static async processRouteGuards(
    routeConfig: RouteConfig,
    targetPath: string,
    params: Record<string, string> = {}
  ): Promise<GuardResult> {
    const guards = this.getRouteGuards(routeConfig);
    const guardResult = await this.runGuards(guards, params);

    if (guardResult === false) {
      // console.log(`Navigation to ${targetPath} blocked by route guard`);
      return { allowed: false };
    }

    if (typeof guardResult === 'string') {
      // console.log(`Navigation to ${targetPath} redirected to ${guardResult} by route guard`);
      return { allowed: false, redirectTo: guardResult };
    }

    // Guards passed
    const viewConstructor = this.getViewConstructor(routeConfig);
    return { allowed: true, viewConstructor };
  }

  private static getRouteGuards(routeConfig: RouteConfig): RouteGuard[] {
    return typeof routeConfig === 'function' ? [] : (routeConfig.guards || []);
  }

  /**
   * Runs all guards in sequence with route parameters and returns the result
   */
  private static async runGuards(
    guards: RouteGuard[], 
    params: Record<string, string>
  ): Promise<boolean | string> {
    for (const guard of guards) {
      const result = await guard(params);
      if (result !== true) {
        return result; // false or redirect path
      }
    }
    return true;
  }
}
