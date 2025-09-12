import { RouteGuard } from "../../core/index.js";

export const Guards = {
  custom: (checkFn: () => boolean | string | Promise<boolean | string>, redirectTo?: string): RouteGuard => {
    return checkFn || redirectTo;
  },

  /**
   * Basic example
   */
  requireAuth: (redirectTo: string = '/login'): RouteGuard => {
    return () => {
      const isAuthenticated = !!localStorage.getItem('user_token');
      return isAuthenticated || redirectTo;
    };
  },
};
