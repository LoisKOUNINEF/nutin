import { NavigationManager } from '#root/dist/src/core/services/router/helpers/navigation-manager.helper.js';


describe('NavigationManager', () => {
  it('should normalize paths by removing trailing slashes', () => {
    expect(NavigationManager.normalizePath('/about/')).toBe('/about');
    expect(NavigationManager.normalizePath('/about///')).toBe('/about');
    expect(NavigationManager.normalizePath('/')).toBe('/');
    expect(NavigationManager.normalizePath('')).toBe('/');
  });

  it('should determine if pushState should be used', () => {
    expect(NavigationManager.shouldPushState(true, '/home', '/about')).toBe(true);
    expect(NavigationManager.shouldPushState(false, '/home', '/about')).toBe(false);
    expect(NavigationManager.shouldPushState(true, '/about', '/about')).toBe(false);
  });

  it('should call pushState when conditions are met', () => {
    const originalPushState = window.history.pushState;
    let called = false;

    window.history.pushState = function (state, title, url) {
      called = true;
      expect(url).toBe('/about');
    };

    NavigationManager.updateHistory('/about', '/home', true);
    expect(called).toBe(true);

    window.history.pushState = originalPushState;
  });

  it('should not call pushState if shouldPushState returns false', () => {
    const originalPushState = window.history.pushState;
    let called = false;

    window.history.pushState = function () {
      called = true;
    };

    NavigationManager.updateHistory('/about', '/home', false);

    expect(called).toBe(false);
    window.history.pushState = originalPushState;
  });

  it('should return current path from location', () => {
    // This test assumes a DOM-like environment
    const currentPath = window.location.pathname;
    expect(NavigationManager.getCurrentPath()).toBe(currentPath);
  });
});
