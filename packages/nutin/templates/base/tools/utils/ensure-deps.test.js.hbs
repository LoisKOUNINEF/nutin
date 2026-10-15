import { isInstalled, getDevInstallArgs } from './ensure-deps.js';

describe('ensure-deps', () => {
  it('getDevInstallArgs uses "install -D" for npm and "add -D" for the others', () => {
    const deps = [{ name: 'a', version: '^1.0.0' }, { name: '@scope/b', version: '^2.0.0' }];

    expect(getDevInstallArgs('npm', deps)).toEqual(['npm', ['install', '-D', 'a@^1.0.0', '@scope/b@^2.0.0']]);
    expect(getDevInstallArgs('pnpm', deps)).toEqual(['pnpm', ['add', '-D', 'a@^1.0.0', '@scope/b@^2.0.0']]);
    expect(getDevInstallArgs('yarn', deps)[1][0]).toBe('add');
    expect(getDevInstallArgs('bun', deps)[1][0]).toBe('add');
  });

  it('isInstalled checks node_modules/<name>/package.json', () => {
    expect(isInstalled('esbuild')).toBeTruthy();
    expect(isInstalled('surely-not-an-installed-package-xyz')).toBeFalsy();
  });
});
