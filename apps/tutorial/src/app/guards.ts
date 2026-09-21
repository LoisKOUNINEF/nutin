import { RouteGuard } from "../core/index.js";

export const Guards = {
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
