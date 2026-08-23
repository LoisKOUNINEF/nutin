import { I18nHelper } from '#root/dist/src/core/base-classes/base-component/helpers/i18n.helper.js';
import { I18nService } from '#root/dist/src/core/services/index.js';

describe('I18nHelper', () => {
  let container;
  let originalTranslate;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    originalTranslate = I18nService.translate;
  });

  afterEach(() => {
    I18nService.translate = originalTranslate;
    container.remove();
    container = null;
  });

  it('sets the placeholder of an input element to the translated value', () => {
    I18nService.translate = (key) => key === 'greeting' ? 'Hello' : key;
    container.innerHTML = '<input data-i18n="greeting">';

    I18nHelper.parseI18nAttributes(container);

    const input = container.querySelector('input');
    expect(input.placeholder).toBe('Hello');
  });

  it('sets the textContent of a non-input element to the translated value', () => {
    I18nService.translate = (key) => key === 'greeting' ? 'Hello' : key;
    container.innerHTML = '<span data-i18n="greeting"></span>';

    I18nHelper.parseI18nAttributes(container);

    const span = container.querySelector('span');
    expect(span.textContent).toBe('Hello');
  });

  it('passes the element textContent as the fallback to translate', () => {
    const calls = [];
    I18nService.translate = (key, fallback) => { calls.push({ key, fallback }); return fallback; };
    container.innerHTML = '<span data-i18n="missing.key">fallback text</span>';

    I18nHelper.parseI18nAttributes(container);

    expect(calls[0].key).toBe('missing.key');
    expect(calls[0].fallback).toBe('fallback text');
    expect(container.querySelector('span').textContent).toBe('fallback text');
  });

  it('processes every element with a data-i18n attribute', () => {
    I18nService.translate = (key) => `[${key}]`;
    container.innerHTML = '<span data-i18n="a"></span><span data-i18n="b"></span>';

    I18nHelper.parseI18nAttributes(container);

    const spans = container.querySelectorAll('span');
    expect(spans[0].textContent).toBe('[a]');
    expect(spans[1].textContent).toBe('[b]');
  });
});
