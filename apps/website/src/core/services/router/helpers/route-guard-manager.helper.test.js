import { RouteGuardsManager } from '#root/dist/src/core/services/router/helpers/route-guard-manager.helper.js';
import { View } from '#root/dist/src/core/index.js';

describe('RouteGuardsManager', () => {
  const MockView = class extends View {};

  const mockViewConstructor = () => new MockView();

  it('should return view constructor from function route config', () => {
    const result = RouteGuardsManager.getViewConstructor(mockViewConstructor);
    expect(result).toBe(mockViewConstructor);
  });

  it('should return view constructor from object route config', () => {
    const config = { view: mockViewConstructor };
    const result = RouteGuardsManager.getViewConstructor(config);
    expect(result).toBe(mockViewConstructor);
  });

  it('should return empty guards array for function route config', () => {
    const result = RouteGuardsManager.getRouteGuards(mockViewConstructor);
    expect(result.length).toBe(0)
  });

  it('should return guards array from object route config', () => {
    const guard = () => true;
    const config = { view: mockViewConstructor, guards: [guard] };
    const result = RouteGuardsManager.getRouteGuards(config);
    expect(JSON.stringify(result)).toBe(JSON.stringify([guard]));
  });

  it('should pass all guards and return true from runGuards', async () => {
    const guards = [() => true, () => Promise.resolve(true)];
    const result = await RouteGuardsManager.runGuards(guards);
    expect(result).toBe(true);
  });

  it('should stop on first false from runGuards', async () => {
    const guards = [() => true, () => false, () => true];
    const result = await RouteGuardsManager.runGuards(guards);
    expect(result).toBe(false);
  });

  it('should stop on redirect string from runGuards', async () => {
    const guards = [() => true, () => '/login'];
    const result = await RouteGuardsManager.runGuards(guards);
    expect(result).toBe('/login');
  });

  it('should return allowed false when guard returns false in processRouteGuards', async () => {
    const config = { view: mockViewConstructor, guards: [() => false] };
    const result = await RouteGuardsManager.processRouteGuards(config, '/test');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBeUndefined();
    expect(result.viewConstructor).toBeUndefined();
  });

  it('should return redirectTo when guard returns a string in processRouteGuards', async () => {
    const config = { view: mockViewConstructor, guards: [() => '/login'] };
    const result = await RouteGuardsManager.processRouteGuards(config, '/private');
    expect(result.allowed).toBe(false);
    expect(result.redirectTo).toBe('/login');
    expect(result.viewConstructor).toBeUndefined();
  });

  it('should return allowed true and viewConstructor when guards pass in processRouteGuards', async () => {
    const config = { view: mockViewConstructor, guards: [() => true] };
    const result = await RouteGuardsManager.processRouteGuards(config, '/dashboard');
    expect(result.allowed).toBe(true);
    expect(typeof result.viewConstructor).toBe('function');
    expect(result.redirectTo).toBeUndefined();
  });
});
