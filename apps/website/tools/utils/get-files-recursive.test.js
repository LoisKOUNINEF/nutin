import fs from 'fs';
import os from 'os';
import path from 'path';
import { getFilesRecursive } from './get-files-recursive.js';

describe('getFilesRecursive', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-get-files-recursive-'));
    fs.mkdirSync(path.join(tmpDir, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'a.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'b.css'), '');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'c.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'd.txt'), '');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('recursively collects files matching a single extension', () => {
    const files = getFilesRecursive(tmpDir, '.js').sort();
    expect(files).toEqual([
      path.join(tmpDir, 'a.js'),
      path.join(tmpDir, 'nested', 'c.js'),
    ].sort());
  });

  it('accepts an extension without a leading dot', () => {
    const files = getFilesRecursive(tmpDir, 'js').sort();
    expect(files).toEqual([
      path.join(tmpDir, 'a.js'),
      path.join(tmpDir, 'nested', 'c.js'),
    ].sort());
  });

  it('accepts an array of extensions', () => {
    const files = getFilesRecursive(tmpDir, ['.css', '.txt']).sort();
    expect(files).toEqual([
      path.join(tmpDir, 'b.css'),
      path.join(tmpDir, 'nested', 'd.txt'),
    ].sort());
  });

  it('returns an empty array when the directory does not exist', () => {
    expect(getFilesRecursive(path.join(tmpDir, 'does-not-exist'), '.js')).toEqual([]);
  });
});
