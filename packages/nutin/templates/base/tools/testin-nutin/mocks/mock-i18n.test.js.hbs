import { MockI18n } from './mock-i18n.js';

describe('MockI18n', () => {
  it('exposes the constructor defaults via currentLanguage', () => {
    const i18n = new MockI18n('fr', ['en', 'fr']);
    expect(i18n.currentLanguage).toBe('fr');
  });

  it('translate/loadTranslations etc. are bare mocks: createMockMethod() ignores the default-impl function passed to it', () => {
    // Every method below is built as `createMockMethod(someDefaultImpl)`, but
    // createMockMethod() takes no parameters - the passed-in default impl is
    // silently dropped. Calling these without an explicit .mockImplementation()
    // first therefore always returns undefined, regardless of the "real-looking"
    // logic written inline in mock-i18n.js.
    const i18n = new MockI18n();

    expect(i18n.translate('some.key')).toBe(undefined);
    expect(i18n.getBrowserLanguage()).toBe(undefined);
  });

  it('translate can be given real interpolation behavior via .mockImplementation', () => {
    const i18n = new MockI18n();
    i18n.setTranslations({ greeting: 'Hello {name}' });
    i18n.translate.mockImplementation((key, params) => {
      const value = i18n._translations[key] || key;
      if (!params) return value;
      return Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), value);
    });

    expect(i18n.translate('greeting', { name: 'Ada' })).toBe('Hello Ada');
  });

  it('setTranslations/setDefaultTranslations seed real, readable state', () => {
    const i18n = new MockI18n();
    i18n.setTranslations({ a: '1' });
    i18n.setDefaultTranslations({ b: '2' });

    expect(i18n._translations).toEqual({ a: '1' });
    expect(i18n._defaultTranslations).toEqual({ b: '2' });
  });

  it('reset() restores the constructor default language and clears translations', () => {
    const i18n = new MockI18n('en');
    i18n.setTranslations({ a: '1' });

    i18n.reset();

    expect(i18n._translations).toEqual({});
    expect(i18n.currentLanguage).toBe('en');
  });
});
