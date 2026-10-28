import { taskService } from './services/task/task.service.js';

export const Guards = {
  /**
   * Basic example
   */
  requireAuth: (redirectTo: string = '/login'): Nutin.RouteGuard => {
    return () => {
      const isAuthenticated = !!localStorage.getItem('user_token');
      return isAuthenticated || redirectTo;
    };
  },

  /**
   * Redirects when the URL's task (?task=<id>) doesn't exist, e.g. after a reload: tasks only live in memory.
   */
  requireTask: (redirectTo: string = '/'): Nutin.RouteGuard => {
    return (_params, { task }) => task === undefined || taskService.getTask(+task) !== undefined || redirectTo;
  },
};
