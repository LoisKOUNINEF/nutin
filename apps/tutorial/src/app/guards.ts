import { taskService } from './services/task/task.service.js';

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

  /**
   * Redirects when the route's task doesn't exist, e.g. after a reload: tasks only live in memory.
   */
  requireTask: (redirectTo: string = '/'): RouteGuard => {
    return ({ id }) => id === undefined || taskService.getTask(+id) !== undefined || redirectTo;
  },
};
