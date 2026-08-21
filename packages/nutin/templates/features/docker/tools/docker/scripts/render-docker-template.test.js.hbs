import fs from 'fs';
import os from 'os';
import path from 'path';
import { renderFromTemplate } from './render-docker-template.js';

describe('renderFromTemplate', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-render-docker-template-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('substitutes a single placeholder and writes the output file', async () => {
    fs.writeFileSync(path.join(tmpDir, 'nginx.conf.template'), '__PORTS_PLACEHOLDER__;\n');

    await renderFromTemplate(tmpDir, 'nginx.conf.template', 'nginx.conf', [
      ['__PORTS_PLACEHOLDER__', 'listen 8080;'],
    ]);

    const output = fs.readFileSync(path.join(tmpDir, 'nginx.conf'), 'utf-8');
    expect(output).toBe('listen 8080;;\n');
  });

  it('substitutes multiple placeholders in one call', async () => {
    fs.writeFileSync(
      path.join(tmpDir, 'Dockerfile.template'),
      'ARG PORT="__PORTS_PLACEHOLDER__"\nCMD wget http://127.0.0.1:__PRIMARY_PORT_PLACEHOLDER__/health\n'
    );

    await renderFromTemplate(tmpDir, 'Dockerfile.template', 'Dockerfile', [
      ['__PORTS_PLACEHOLDER__', '8080 8081 3000'],
      ['__PRIMARY_PORT_PLACEHOLDER__', '8080'],
    ]);

    const output = fs.readFileSync(path.join(tmpDir, 'Dockerfile'), 'utf-8');
    expect(output).toBe('ARG PORT="8080 8081 3000"\nCMD wget http://127.0.0.1:8080/health\n');
  });

  it('throws when the template file does not exist', async () => {
    await expect(() =>
      renderFromTemplate(tmpDir, 'missing.template', 'missing', [['__X__', 'y']])
    ).toThrow('missing.template');
  });

  it('throws when a placeholder token is missing from the template, without writing the output', async () => {
    fs.writeFileSync(path.join(tmpDir, 'nginx.conf.template'), 'listen 9090;\n');

    await expect(() =>
      renderFromTemplate(tmpDir, 'nginx.conf.template', 'nginx.conf', [
        ['__PORTS_PLACEHOLDER__', 'listen 8080;'],
      ])
    ).toThrow('__PORTS_PLACEHOLDER__');

    expect(fs.existsSync(path.join(tmpDir, 'nginx.conf'))).toBeFalsy();
  });
});
