import { findDuplicateRouteKeys, hasRouteKey } from './route-keys.js';

const TS = { loader: 'ts', sourcefile: 'routes.ts' };

describe('findDuplicateRouteKeys', () => {
  it('returns nothing for distinct keys, TypeScript syntax included', async () => {
    const source = `
      export const appRoutes: Routes = {
        '/': () => new HomeView(),
        '/about': () => new AboutView() as any,
        '/users/:id': () => new UserView(),
      };`;

    expect(await findDuplicateRouteKeys(source, TS)).toEqual([]);
  });

  it('reports a duplicate across quote styles and computed keys, with its line', async () => {
    const source = [
      'export const appRoutes: Routes = {',
      "  '/': () => new HomeView(),",
      '  "/": () => new OtherView(),',
      "  ['/c']: () => new C(),",
      "  ['/c']: () => new D(),",
      '};',
    ].join('\n');

    expect(await findDuplicateRouteKeys(source, TS)).toEqual([
      { key: '/', line: 3 },
      { key: '/c', line: 5 },
    ]);
  });

  it('reports a duplicated :param route', async () => {
    const source = `export const appRoutes = {
      '/users/:id': () => new A(),
      '/users/:id': () => new B(),
    };`;

    expect((await findDuplicateRouteKeys(source, { loader: 'js', sourcefile: 'routes.js' })).map((d) => d.key)).toEqual(['/users/:id']);
  });

  it('does not flag the view/guards keys shared by several guarded routes', async () => {
    const source = `export const appRoutes: Routes = {
      '/admin': { view: () => new AdminView(), guards: [() => true] },
      '/settings': { view: () => new SettingsView(), guards: [() => '/'] },
    };`;

    expect(await findDuplicateRouteKeys(source, TS)).toEqual([]);
  });

  it('flags a plain and a guarded route sharing a path', async () => {
    const source = `export const appRoutes: Routes = {
      '/admin': () => new AdminView(),
      '/admin': { view: () => new AdminView(), guards: [() => true] },
    };`;

    expect((await findDuplicateRouteKeys(source, TS)).map((d) => d.key)).toEqual(['/admin']);
  });

  it('checks the whole file, not only appRoutes', async () => {
    const source = `const other = { a: 1, a: 2 };
      export const appRoutes: Routes = { '/': () => new HomeView() };`;

    expect(await findDuplicateRouteKeys(source, TS)).toEqual([{ key: 'a', line: 1 }]);
  });

  it('rejects when the source does not parse', async () => {
    await expect(() => findDuplicateRouteKeys('export const appRoutes = {', TS)).toThrow();
  });
});

describe('hasRouteKey', () => {
  it('finds the key in each of its forms, TypeScript syntax included', async () => {
    const forms = [
      "export const appRoutes: Nutin.Routes = { '/': () => new HomeView() as any, '/404': () => new NotFoundView() };",
      'export const appRoutes = { "/404": () => new NotFoundView() };',
      "export const appRoutes = { ['/404']: () => new NotFoundView() };",
      "export const appRoutes = {\n  '/404': () => new NotFoundView(),\n};",
    ];
    for (const source of forms) {
      expect(await hasRouteKey(source, '/404', TS)).toBe(true);
    }
  });

  it('ignores a commented-out key, and the path used as a value', async () => {
    const commented = "export const appRoutes = {\n  '/': () => new HomeView(),\n  // '/404': () => new NotFoundView(),\n};";
    const values = [
      "const fallback = flag ? '/404' : '/';",
      "export const appRoutes = { '/a': { view: () => new A(), guards: [() => '/404'] }, '/b': { redirectTo: '/404' } };",
    ].join('\n');

    expect(await hasRouteKey(commented, '/404', TS)).toBe(false);
    expect(await hasRouteKey(values, '/404', TS)).toBe(false);
  });

  it('returns false without the key, and matches it exactly', async () => {
    expect(await hasRouteKey("export const appRoutes = { '/': () => new HomeView() };", '/404', TS)).toBe(false);
    expect(await hasRouteKey("export const appRoutes = { '/4040': () => new A() };", '/404', TS)).toBe(false);
  });
});
