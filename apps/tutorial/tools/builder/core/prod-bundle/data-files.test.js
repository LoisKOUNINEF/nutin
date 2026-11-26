import fs from 'fs';
import os from 'os';
import path from 'path';
import { hashDataFiles, readDataFilesMap } from './data-files.js';

let root;

function write(relPath, content) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

describe('data-files', () => {
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'nutin-data-files-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('copies each locale and manifest to a content-hashed name and maps the plain URL to it', () => {
    write('locales/en.json', '{"a":"A"}');
    write('generated/docs.en.json', '{"pages":{}}');

    const map = hashDataFiles(root);

    expect(Object.keys(map)).toEqual(['/locales/en.json', '/generated/docs.en.json']);
    expect(/^\/locales\/en\.[0-9a-f]{8}\.json$/.test(map['/locales/en.json'])).toBeTruthy();
    expect(/^\/generated\/docs\.en\.[0-9a-f]{8}\.json$/.test(map['/generated/docs.en.json'])).toBeTruthy();
    expect(fs.readFileSync(path.join(root, map['/locales/en.json']), 'utf-8')).toBe('{"a":"A"}');
    // The plain file stays.
    expect(fs.existsSync(path.join(root, 'locales/en.json'))).toBeTruthy();
  });

  it('gives the same content the same name, and changed content a new one', () => {
    write('locales/en.json', '{"a":"A"}');
    const first = hashDataFiles(root)['/locales/en.json'];
    fs.rmSync(path.join(root, first));
    expect(hashDataFiles(root)['/locales/en.json']).toBe(first);

    write('locales/en.json', '{"a":"B"}');
    expect(hashDataFiles(root)['/locales/en.json']).not.toBe(first);
  });

  it('skips files that are not JSON, already hashed, and missing folders', () => {
    write('locales/README.txt', 'x');
    write('locales/en.0123abcd.json', '{}');

    expect(hashDataFiles(root)).toEqual({});
  });

  it('readDataFilesMap returns the written map, or {} without one', () => {
    const mapFile = path.join(root, 'data-files.json');
    expect(readDataFilesMap(mapFile)).toEqual({});

    fs.writeFileSync(mapFile, '{"/locales/en.json":"/locales/en.0123abcd.json"}');
    expect(readDataFilesMap(mapFile)).toEqual({ '/locales/en.json': '/locales/en.0123abcd.json' });
  });
});
