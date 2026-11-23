import { LANGUAGES, DEFAULT_LANGUAGE, FALLBACK_LANGUAGES, i18nOptionError, resolveI18n } from './languages.js';

describe('languages', () => {
  it('resolves LANGUAGES and DEFAULT_LANGUAGE from nutin.config.js "i18n"', () => {
    expect(Array.isArray(LANGUAGES)).toBeTruthy();
    expect(LANGUAGES.length).toBeGreaterThan(0);
    expect(DEFAULT_LANGUAGE).toBe(LANGUAGES[0]);
  });

  describe('resolveI18n', () => {
    it('turns i18n on with a non-empty list, the first language being the default', () => {
      expect(resolveI18n(['fr', 'en'])).toEqual({ enabled: true, languages: ['fr', 'en'], defaultLanguage: 'fr' });
    });

    it('turns i18n off with an empty list, falling back to English', () => {
      expect(resolveI18n([])).toEqual({ enabled: false, languages: FALLBACK_LANGUAGES, defaultLanguage: 'en' });
    });

    it('turns i18n on with true, English only', () => {
      expect(resolveI18n(true)).toEqual({ enabled: true, languages: ['en'], defaultLanguage: 'en' });
    });

    it('turns i18n off with false or a missing option', () => {
      expect(resolveI18n(false).enabled).toBe(false);
      expect(resolveI18n(undefined)).toEqual({ enabled: false, languages: ['en'], defaultLanguage: 'en' });
    });

    it('copies the list, so callers can\'t change the config', () => {
      const option = ['en'];
      resolveI18n(option).languages.push('fr');
      expect(option).toEqual(['en']);
    });
  });

  describe('i18nOptionError', () => {
    it('accepts booleans, a missing option and lists of language codes', () => {
      [true, false, undefined, [], ['en'], ['pt-BR', 'en']].forEach((option) => {
        expect(i18nOptionError(option)).toBe(null);
      });
    });

    it('rejects anything else than a boolean or a list', () => {
      expect(i18nOptionError('en')).toContain('must be a list of language codes');
      expect(i18nOptionError({ languages: ['en'] })).toContain('must be a list of language codes');
    });

    it('rejects invalid language codes', () => {
      expect(i18nOptionError(['e n'])).toContain('invalid language code "e n"');
      expect(i18nOptionError(['en', ''])).toContain('invalid language code ""');
      expect(i18nOptionError([1])).toContain('invalid language code 1');
    });

    it('rejects duplicates', () => {
      expect(i18nOptionError(['en', 'fr', 'en'])).toContain('"en" more than once');
    });
  });
});
