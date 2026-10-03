import { MockRouter } from './mock-router.js';

describe('MockRouter', () => {
  it('stores the routes passed to the constructor', () => {
    const routes = { '/home': {} };
    const router = new MockRouter(routes);

    expect(router.routes).toBe(routes);
  });

  it('navigate/reload are independent trackable mocks', async () => {
    const router = new MockRouter();
    await router.navigate('/about');

    expect(router.navigate.calls).toEqual([['/about']]);
    expect(router.reload.calls).toEqual([]);
  });

  it('getCurrentParams/getParam read the params seeded with setParams()', () => {
    const router = new MockRouter();
    router.setParams({ id: '42' });

    expect(router.getCurrentParams()).toEqual({ id: '42' });
    expect(router.getParam('id')).toBe('42');
    expect(router.getParam('missing')).toBe(undefined);
  });

  it('getCurrentParams returns a copy', () => {
    const router = new MockRouter();
    router.setParams({ id: '42' });
    router.getCurrentParams().id = 'changed';

    expect(router.getParam('id')).toBe('42');
  });

  it('reset() clears every mock method and the seeded params', async () => {
    const router = new MockRouter();
    await router.navigate('/about');
    router.setParams({ id: '42' });

    router.reset();

    expect(router.navigate.calls).toEqual([]);
    expect(router.getCurrentParams()).toEqual({});
  });
});
