import { localeRedirects } from './locale-redirects.js';

describe('localeRedirects', () => {
  it('redirects nothing without i18n', () => {
    expect(localeRedirects({ i18n: false, languages: ['en'], defaultLanguage: 'en' })).toBe('');
  });

  it('redirects "/" to the default language', () => {
    const conf = localeRedirects({ i18n: true, languages: ['en', 'fr'], defaultLanguage: 'fr' });
    expect(conf).toContain('location = / {\n        return 301 /fr/$is_args$args;\n    }');
  });

  it('redirects unprefixed, extensionless paths with the raw request URI', () => {
    const conf = localeRedirects({ i18n: true, languages: ['en', 'fr'], defaultLanguage: 'en' });
    expect(conf).toContain('location ~ ^/(?!(?:en|fr)(?:/|$))[^.]*$ {\n        return 301 /en$request_uri;\n    }');
  });

  it('only matches unprefixed, extensionless paths', () => {
    const conf = localeRedirects({ i18n: true, languages: ['en', 'pt-BR'], defaultLanguage: 'en' });
    const pattern = new RegExp(conf.match(/location ~ (\S+) \{/)[1]);

    ['/docs', '/docs/', '/docs/api/x', '/english', '/enx/docs', '/pt-BRx'].forEach((path) => {
      expect(pattern.test(path)).toBe(true);
    });
    ['/en', '/en/', '/en/docs/', '/pt-BR/docs', '/robots.txt', '/main.1a2b.css', '/assets/og.jpg'].forEach((path) => {
      expect(pattern.test(path)).toBe(false);
    });
  });

  it('throws on a language code that could break the nginx config', () => {
    expect(() => localeRedirects({ i18n: true, languages: ['en', 'f r'], defaultLanguage: 'en' })).toThrow('invalid language code');
    expect(() => localeRedirects({ i18n: true, languages: ['en'], defaultLanguage: 'en|.*' })).toThrow('invalid language code');
  });
});
