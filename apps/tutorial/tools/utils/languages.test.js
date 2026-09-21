import { LANGUAGES, DEFAULT_LANGUAGE } from './languages.js';

describe('languages', () => {
  it('reads LANGUAGES from config/languages.json', () => {
    expect(Array.isArray(LANGUAGES)).toBeTruthy();
    expect(LANGUAGES.length).toBeGreaterThan(0);
  });

  it('reads DEFAULT_LANGUAGE from config/languages.json', () => {
    expect(typeof DEFAULT_LANGUAGE).toBe('string');
  });

  it('includes the default language among the supported languages', () => {
    expect(LANGUAGES).toContain(DEFAULT_LANGUAGE);
  });
});
