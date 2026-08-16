import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTestFiles } from './test-discovery.js';

// getTestFiles resolves its own `projectRoot` anchor one directory short of the real
// project root (see tools/testin-nutin/runner.js, which always calls it as
// `getTestFiles(path.join('..', origin))` to compensate). This test file lives in the
// same directory as test-discovery.js, so it can recompute that same anchor to build
// `dir` arguments the same way the real runner does.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const relativeToCwd = path.relative(process.cwd(), __dirname);
const levelsUp = relativeToCwd.split(path.sep).length - 1;
const projectRoot = path.resolve(__dirname, ...Array(levelsUp).fill('..'));

describe('getTestFiles', () => {
  let tmpDir;
  let relDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-test-discovery-'));
    relDir = path.relative(projectRoot, tmpDir);

    fs.mkdirSync(path.join(tmpDir, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'a.test.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'b.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'c.test.js'), '');
    fs.writeFileSync(path.join(tmpDir, 'nested', 'readme.md'), '');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('recursively finds only files ending in .test.js', () => {
    const files = getTestFiles(relDir).sort();
    expect(files).toEqual(
      [path.join(tmpDir, 'a.test.js'), path.join(tmpDir, 'nested', 'c.test.js')].sort()
    );
  });

  it('returns an empty array for a directory that does not exist', () => {
    expect(getTestFiles(path.join(relDir, 'does-not-exist'))).toEqual([]);
  });
});
