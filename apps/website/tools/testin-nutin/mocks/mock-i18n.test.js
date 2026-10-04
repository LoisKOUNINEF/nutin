import { MockI18n } from './mock-i18n.js';

describe('MockI18n', () => {
  it('exposes the constructor defaults via the language getters', () => {
    const i18n = new MockI18n('fr', ['en', 'fr']);

    expect(i18n.currentLanguage).toBe('fr');
    expect(i18n.defaultLanguage).toBe('fr');
    expect(i18n.languages).toEqual(['en', 'fr']);
  });

  it('translate() falls back to textContent, then to the key itself', () => {
    const i18n = new MockI18n();

    expect(i18n.translate('some.key', 'Fallback text')).toBe('Fallback text');
    expect(i18n.translate('some.key')).toBe('some.key');
  });

  it('translate() resolves nested dot keys from setTranslations()', () => {
    const i18n = new MockI18n();
    i18n.setTranslations({ home: { title: 'Home' } });

    expect(i18n.translate('home.title')).toBe('Home');
  });

  it('translate() falls back to the default-language translations off the default language', async () => {
    const i18n = new MockI18n('en', ['en', 'fr']);
    i18n.setDefaultTranslations({ greeting: 'Hello' });
    await i18n.loadTranslations('fr');

    expect(i18n.translate('greeting')).toBe('Hello');
  });

  it('getTranslationObject() returns the nested value, or null', () => {
    const i18n = new MockI18n();
    i18n.setTranslations({ nav: { home: 'Home', about: 'About' } });

    expect(i18n.getTranslationObject('nav')).toEqual({ home: 'Home', about: 'About' });
    expect(i18n.getTranslationObject('missing')).toBe(null);
  });

  it('setCurrentLanguage() updates currentLanguage and notifies onLanguageChange() callbacks', async () => {
    const i18n = new MockI18n('en', ['en', 'fr']);
    let payload;
    i18n.onLanguageChange((data) => { payload = data; });

    await i18n.setCurrentLanguage('fr');

    expect(i18n.currentLanguage).toBe('fr');
    expect(payload).toEqual({ lang: 'fr' });
    expect(i18n.setCurrentLanguage).toHaveBeenCalledWith('fr');
  });

  it('onLanguageChange() returns a function that stops further notifications', async () => {
    const i18n = new MockI18n('en', ['en', 'fr']);
    let calls = 0;
    const unsubscribe = i18n.onLanguageChange(() => { calls++; });
    unsubscribe();

    await i18n.setCurrentLanguage('fr');

    expect(calls).toBe(0);
  });

  it('translate is still trackable as a mock alongside its default implementation', () => {
    const i18n = new MockI18n();
    i18n.translate('some.key');

    expect(i18n.translate).toHaveBeenCalledWith('some.key');
  });

  it('reset() restores the constructor default language and clears translations', async () => {
    const i18n = new MockI18n('en', ['en', 'fr']);
    i18n.setTranslations({ a: '1' });
    await i18n.setCurrentLanguage('fr');

    i18n.reset();

    expect(i18n._translations).toEqual({});
    expect(i18n.currentLanguage).toBe('en');
  });
});
