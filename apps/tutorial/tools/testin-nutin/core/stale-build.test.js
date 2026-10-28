import fs from 'fs';
import os from 'os';
import path from 'path';
import { findChangedSinceBuild, BUILD_STAMP } from './stale-build.js';

describe('findChangedSinceBuild', () => {
  let root;
  const write = (file, mtime) => {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, '');
    fs.utimesSync(full, mtime, mtime);
  };
  const BUILT = new Date('2026-01-01T12:00:00Z');
  const BEFORE = new Date('2026-01-01T11:00:00Z');
  const AFTER = new Date('2026-01-01T13:00:00Z');

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'stale-build-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('returns null when nothing changed since the last build', () => {
    write(BUILD_STAMP, BUILT);
    write('src/app/main.ts', BEFORE);
    write('config/seo.json', BEFORE);
    write('nutin.config.js', BEFORE);
    expect(findChangedSinceBuild(root)).toBe(null);
  });

  it('returns a source changed after the last build', () => {
    write(BUILD_STAMP, BUILT);
    write('src/app/main.ts', BEFORE);
    write('src/app/views/home/home.view.html', AFTER);
    expect(findChangedSinceBuild(root)).toBe(path.join('src', 'app', 'views', 'home', 'home.view.html'));
  });

  it('checks config/ and nutin.config.js too', () => {
    write(BUILD_STAMP, BUILT);
    write('config/seo.json', AFTER);
    expect(findChangedSinceBuild(root)).toBe(path.join('config', 'seo.json'));

    fs.utimesSync(path.join(root, 'config', 'seo.json'), BEFORE, BEFORE);
    write('nutin.config.js', AFTER);
    expect(findChangedSinceBuild(root)).toBe('nutin.config.js');
  });

  it('ignores test files and dotfiles, which the build does not use', () => {
    write(BUILD_STAMP, BUILT);
    write('src/app/main.test.js', AFTER);
    write('src/.DS_Store', AFTER);
    expect(findChangedSinceBuild(root)).toBe(null);
  });

  it('returns null without a build stamp', () => {
    write('src/app/main.ts', AFTER);
    expect(findChangedSinceBuild(root)).toBe(null);
  });
});
