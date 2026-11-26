import { isInstalled, getDevInstallArgs, buildWithYes } from './ensure-deps.js';

describe('ensure-deps', () => {
  it('getDevInstallArgs uses "install -D" for npm and "add -D" for the others', () => {
    const deps = [{ name: 'a', version: '^1.0.0' }, { name: '@scope/b', version: '^2.0.0' }];

    expect(getDevInstallArgs('npm', deps)).toEqual(['npm', ['install', '-D', 'a@^1.0.0', '@scope/b@^2.0.0']]);
    expect(getDevInstallArgs('pnpm', deps)).toEqual(['pnpm', ['add', '-D', 'a@^1.0.0', '@scope/b@^2.0.0']]);
    expect(getDevInstallArgs('yarn', deps)[1][0]).toBe('add');
    expect(getDevInstallArgs('bun', deps)[1][0]).toBe('add');
  });

  it('buildWithYes passes -y after "--" with npm only', () => {
    expect(buildWithYes('npm')).toBe('npm run build -- -y');
    expect(buildWithYes('pnpm')).toBe('pnpm run build -y');
    expect(buildWithYes('yarn')).toBe('yarn run build -y');
    expect(buildWithYes('bun')).toBe('bun run build -y');
  });

  it('isInstalled checks node_modules/<name>/package.json', () => {
    expect(isInstalled('esbuild')).toBeTruthy();
    expect(isInstalled('surely-not-an-installed-package-xyz')).toBeFalsy();
  });
});
