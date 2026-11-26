import { sharedDefine, slimNutinConfig, slimSeoConfig, isPlainData } from './bundle-options.js';

describe('bundle-options', () => {
  it('sharedDefine sets NODE_ENV, the i18n flag, the markdown sources and an empty data files map from the build config', () => {
    expect(sharedDefine({ isProd: true, i18n: false })).toEqual({
      'process.env.NODE_ENV': '"production"',
      'globalThis.__NUTIN_I18N__': 'false',
      'globalThis.__NUTIN_MARKDOWN_SOURCES__': JSON.stringify('[]'),
      'globalThis.__NUTIN_DATA_FILES__': JSON.stringify('{}'),
    });
    expect(sharedDefine({ isProd: false, i18n: true, markdownSources: { sourceFolders: ['docs', { folder: 'x', seo: false }] } })).toEqual({
      'process.env.NODE_ENV': '"development"',
      'globalThis.__NUTIN_I18N__': 'true',
      'globalThis.__NUTIN_MARKDOWN_SOURCES__': JSON.stringify('["docs",{"folder":"x","seo":false}]'),
      'globalThis.__NUTIN_DATA_FILES__': JSON.stringify('{}'),
    });
  });

  it('sharedDefine passes the data files map as a JSON string', () => {
    const dataFiles = { '/locales/en.json': '/locales/en.0123abcd.json' };
    expect(sharedDefine({ isProd: true, i18n: true, dataFiles })['globalThis.__NUTIN_DATA_FILES__'])
      .toBe(JSON.stringify(JSON.stringify(dataFiles)));
  });

  it('slimNutinConfig drops tooling-only keys and keeps everything app code may read', () => {
    const slim = slimNutinConfig({
      i18n: true,
      generateSEOFiles: false,
      markdownSources: { sourceFolders: ['docs'] },
      myAppKey: 'kept',
      builder: { esbuild: { minify: true } },
      testinNutin: { includeApp: false },
      dockerPorts: [9090],
    });

    expect(slim).toEqual({
      i18n: true,
      generateSEOFiles: false,
      myAppKey: 'kept',
    });
  });

  it('slimNutinConfig returns null when the remaining config is not plain data', () => {
    expect(slimNutinConfig({ i18n: false, onBuild: () => {} })).toBe(null);
    expect(slimNutinConfig({ i18n: false, pattern: /x/ })).toBe(null);
  });

  it('slimNutinConfig ignores non-plain values inside tooling-only keys', () => {
    expect(slimNutinConfig({ i18n: false, builder: { plugin: () => {} } })).toEqual({ i18n: false });
  });

  it('slimSeoConfig keeps only each route\'s path and title when SEO generation is enabled', () => {
    const seo = {
      baseUrl: 'https://example.com',
      disallowBots: ['GPTBot'],
      routes: [{ path: '/', title: { en: 'Home' }, description: 'd', ogImage: '/og.jpg' }],
    };

    expect(slimSeoConfig(seo, true)).toEqual({ routes: [{ path: '/', title: { en: 'Home' } }] });
  });

  it('slimSeoConfig returns an empty object when SEO generation is disabled or routes are missing', () => {
    expect(slimSeoConfig({ routes: [{ path: '/', title: 'Home' }] }, false)).toEqual({});
    expect(slimSeoConfig({}, true)).toEqual({ routes: [] });
  });

  it('isPlainData accepts JSON-like values only', () => {
    expect(isPlainData({ a: [1, 'b', true, null, { c: 2 }] })).toBeTruthy();
    expect(isPlainData(undefined)).toBeFalsy();
    expect(isPlainData(new Date())).toBeFalsy();
    expect(isPlainData([() => {}])).toBeFalsy();
  });
});
