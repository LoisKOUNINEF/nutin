export type GuardResult = {
  allowed: boolean,
  redirectTo?: string,
  viewConstructor?: ViewFactory,
}

export function getViewConstructor(routeConfig: RouteConfig): ViewFactory {
  return typeof routeConfig === 'function' ? routeConfig : routeConfig.view;
}

export async function processRouteGuards(
  routeConfig: RouteConfig,
  targetPath: string,
  params: Record<string, string> = {}
): Promise<GuardResult> {
  const guards = getRouteGuards(routeConfig);
  const guardResult = await runGuards(guards, params);

  if (guardResult === false) {
    // console.log(`Navigation to ${targetPath} blocked by route guard`);
    return { allowed: false };
  }

  if (typeof guardResult === 'string') {
    // console.log(`Navigation to ${targetPath} redirected to ${guardResult} by route guard`);
    return { allowed: false, redirectTo: guardResult };
  }

  // Guards passed
  const viewConstructor = getViewConstructor(routeConfig);
  return { allowed: true, viewConstructor };
}

function getRouteGuards(routeConfig: RouteConfig): RouteGuard[] {
  return typeof routeConfig === 'function' ? [] : (routeConfig.guards || []);
}

/**
 * Runs all guards in sequence with route parameters and returns the result
 */
async function runGuards(
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
