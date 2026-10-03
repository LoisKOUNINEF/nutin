import fs from 'fs';
import os from 'os';
import path from 'path';
import { resolveFetch } from './ssr-polyfills.js';

describe('resolveFetch (SSR fetch shim)', () => {
  let staticDir;

  beforeEach(() => {
    staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-ssr-fetch-'));
    fs.mkdirSync(path.join(staticDir, 'generated'));
    fs.writeFileSync(path.join(staticDir, 'generated', 'docs.json'), '{"pages":{"a":1}}');
    fs.writeFileSync(path.join(staticDir, 'notes.txt'), 'plain text');
  });

  afterEach(() => {
    fs.rmSync(staticDir, { recursive: true, force: true });
  });

  it('serves a mockFetch entry first', async () => {
    const response = await resolveFetch('/generated/docs.json', { mockFetch: { '/generated/docs.json': { mocked: true } }, staticDir });

    expect(await response.json()).toEqual({ mocked: true });
  });

  it('serves a file the build wrote, parsed as JSON for .json', async () => {
    const response = await resolveFetch('/generated/docs.json?v=1', { staticDir });

    expect(response.ok).toBeTruthy();
    expect(await response.json()).toEqual({ pages: { a: 1 } });
  });

  it('serves other built files as text', async () => {
    const response = await resolveFetch('/notes.txt', { staticDir });

    expect(await response.text()).toBe('plain text');
  });

  it('refuses paths escaping the build folder', async () => {
    await expect(() => resolveFetch('/../../etc/hosts', { staticDir })).toThrow('Unexpected fetch');
    await expect(() => resolveFetch('/%2e%2e/%2e%2e/etc/hosts', { staticDir })).toThrow('Unexpected fetch');
  });

  it('still throws for an unknown endpoint', async () => {
    await expect(() => resolveFetch('/api/users', { staticDir })).toThrow('Unexpected fetch');
    await expect(() => resolveFetch('https://api.test/users', { staticDir })).toThrow('Unexpected fetch');
  });
});
