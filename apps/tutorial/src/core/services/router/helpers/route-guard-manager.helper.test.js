import * as RouteGuardsManager from '#root/dist/src/core/services/router/helpers/route-guard-manager.helper.js';
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

  it('allows a function route config, which has no guards', async () => {
    const result = await RouteGuardsManager.processRouteGuards(mockViewConstructor, '/');
    expect(result.allowed).toBe(true);
    expect(result.viewConstructor).toBe(mockViewConstructor);
  });

  it('allows an object route config without guards', async () => {
    const result = await RouteGuardsManager.processRouteGuards({ view: mockViewConstructor }, '/');
    expect(result.allowed).toBe(true);
  });

  it('runs every guard, sync or async, and allows when all return true', async () => {
    const calls = [];
    const guards = [() => { calls.push(1); return true; }, () => { calls.push(2); return Promise.resolve(true); }];
    const result = await RouteGuardsManager.processRouteGuards({ view: mockViewConstructor, guards }, '/');
    expect(result.allowed).toBe(true);
    expect(calls).toEqual([1, 2]);
  });

  it('stops at the first guard returning false', async () => {
    let ranAfter = false;
    const guards = [() => true, () => false, () => { ranAfter = true; return true; }];
    const result = await RouteGuardsManager.processRouteGuards({ view: mockViewConstructor, guards }, '/');
    expect(result.allowed).toBe(false);
    expect(ranAfter).toBe(false);
  });

  it('stops at the first guard returning a redirect', async () => {
    let ranAfter = false;
    const guards = [() => true, () => '/login', () => { ranAfter = true; return true; }];
    const result = await RouteGuardsManager.processRouteGuards({ view: mockViewConstructor, guards }, '/');
    expect(result.redirectTo).toBe('/login');
    expect(ranAfter).toBe(false);
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

  it('passes the actual route params through processRouteGuards to each guard', async () => {
    const receivedParams = [];
    const guard = (params) => { receivedParams.push(params); return true; };
    const config = { view: mockViewConstructor, guards: [guard] };

    await RouteGuardsManager.processRouteGuards(config, '/users/42', { id: '42' });

    expect(receivedParams.length).toBe(1);
    expect(receivedParams[0]).toEqual({ id: '42' });
  });

  it('defaults params to an empty object when none are passed to processRouteGuards', async () => {
    const receivedParams = [];
    const guard = (params) => { receivedParams.push(params); return true; };
    const config = { view: mockViewConstructor, guards: [guard] };

    await RouteGuardsManager.processRouteGuards(config, '/dashboard');

    expect(receivedParams[0]).toEqual({});
  });
});
