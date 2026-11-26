import { dataFileUrl, fetchDataFile } from '#root/dist/src/core/services/index.js';

const MAP = JSON.stringify({ '/locales/en.json': '/locales/en.0123abcd.json' });
const ok = (body) => ({ ok: true, status: 200, body });
const missing = () => ({ ok: false, status: 404 });

let originalFetch;
let calls;

// Each call takes the next response; a function response is called (to reject, for instance).
function mockFetch(...responses) {
  calls = [];
  global.fetch = (url) => {
    calls.push(url);
    const response = responses.shift();
    return typeof response === 'function' ? response() : Promise.resolve(response);
  };
}

describe('dataFiles', () => {
  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete globalThis.__NUTIN_DATA_FILES__;
  });

  it('dataFileUrl returns the URL unchanged without a data files map (dev builds, tests)', () => {
    expect(dataFileUrl('/locales/en.json')).toBe('/locales/en.json');
  });

  it('dataFileUrl returns the hashed URL the build mapped, and any other URL unchanged', () => {
    globalThis.__NUTIN_DATA_FILES__ = MAP;

    expect(dataFileUrl('/locales/en.json')).toBe('/locales/en.0123abcd.json');
    expect(dataFileUrl('/locales/fr.json')).toBe('/locales/fr.json');
    expect(dataFileUrl('constructor')).toBe('constructor');
  });

  it('fetchDataFile fetches the hashed copy once when it exists', async () => {
    globalThis.__NUTIN_DATA_FILES__ = MAP;
    mockFetch(ok('hashed'));

    expect((await fetchDataFile('/locales/en.json')).body).toBe('hashed');
    expect(calls).toEqual(['/locales/en.0123abcd.json']);
  });

  it('fetchDataFile falls back to the plain URL when the hashed copy is gone (a tab from before a deploy)', async () => {
    globalThis.__NUTIN_DATA_FILES__ = MAP;
    mockFetch(missing(), ok('plain'));

    expect((await fetchDataFile('/locales/en.json')).body).toBe('plain');
    expect(calls).toEqual(['/locales/en.0123abcd.json', '/locales/en.json']);
  });

  it('fetchDataFile makes a single request without a map, and returns its error status as is', async () => {
    mockFetch(missing());

    expect((await fetchDataFile('/locales/en.json')).status).toBe(404);
    expect(calls).toEqual(['/locales/en.json']);
  });

  it('fetchDataFile lets a network error through: the plain URL would fail the same way', async () => {
    globalThis.__NUTIN_DATA_FILES__ = MAP;
    mockFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(() => fetchDataFile('/locales/en.json')).toThrow('Failed to fetch');
    expect(calls).toEqual(['/locales/en.0123abcd.json']);
  });
});
