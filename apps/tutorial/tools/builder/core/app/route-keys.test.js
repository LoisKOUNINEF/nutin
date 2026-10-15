import { findDuplicateRouteKeys } from './route-keys.js';

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
