export type GuardResult = {
  allowed: boolean,
  redirectTo?: string,
  viewConstructor?: Nutin.ViewFactory,
}

export function getViewConstructor(routeConfig: Nutin.RouteConfig): Nutin.ViewFactory {
  return typeof routeConfig === 'function' ? routeConfig : routeConfig.view;
}

export async function processRouteGuards(
  routeConfig: Nutin.RouteConfig,
  params: Record<string, string> = {},
  query: Record<string, string> = {}
): Promise<GuardResult> {
  const guards = getRouteGuards(routeConfig);
  const guardResult = await runGuards(guards, params, query);

  if (guardResult === false) {
    return { allowed: false };
  }

  if (typeof guardResult === 'string') {
    return { allowed: false, redirectTo: guardResult };
  }

  // Guards passed
  const viewConstructor = getViewConstructor(routeConfig);
  return { allowed: true, viewConstructor };
}

function getRouteGuards(routeConfig: Nutin.RouteConfig): Nutin.RouteGuard[] {
  return typeof routeConfig === 'function' ? [] : (routeConfig.guards || []);
}

/**
 * Runs all guards in sequence with route and query parameters and returns the result
 */
async function runGuards(
  guards: Nutin.RouteGuard[], 
  params: Record<string, string>,
  query: Record<string, string>
): Promise<boolean | string> {
  for (const guard of guards) {
    const result = await guard(params, query);
    if (result !== true) {
      return result; // false or redirect path
    }
  }
  return true;
}
