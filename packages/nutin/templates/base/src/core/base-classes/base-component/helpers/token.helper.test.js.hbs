import { TokenHelper } from '#root/dist/src/core/base-classes/base-component/helpers/token.helper.js';

describe('TokenHelper', () => {
  const makeEvent = (overrides = {}) => ({
    preventDefault: () => {},
    target: null,
    clientX: 10,
    clientY: 20,
    key: 'Enter',
    code: 'Enter',
    ...overrides,
  });

  it('resolve always calls event.preventDefault()', () => {
    let called = false;
    const ev = makeEvent({ preventDefault: () => { called = true; } });
    TokenHelper.resolve('@id', document.createElement('div'), ev);
    expect(called).toBe(true);
  });

  it('@id resolves and escapes the element id', () => {
    const el = document.createElement('div');
    el.id = '<x>';
    expect(TokenHelper.resolve('@id', el, makeEvent())).toBe('&lt;x&gt;');
  });

  it('@class resolves the escaped className', () => {
    const el = document.createElement('div');
    el.className = 'a b';
    expect(TokenHelper.resolve('@class', el, makeEvent())).toBe('a b');
  });

  it('@name resolves the escaped name attribute', () => {
    const el = document.createElement('input');
    el.name = 'field';
    expect(TokenHelper.resolve('@name', el, makeEvent())).toBe('field');
  });

  it('@name falls back to an empty string when el has no name property', () => {
    const el = document.createElement('div');
    expect(TokenHelper.resolve('@name', el, makeEvent())).toBe('');
  });

  it('@tag resolves the escaped tag name', () => {
    const el = document.createElement('div');
    expect(TokenHelper.resolve('@tag', el, makeEvent())).toBe('DIV');
  });

  it('@value resolves the sanitized input value', () => {
    const el = document.createElement('input');
    el.value = '<b>';
    expect(TokenHelper.resolve('@value', el, makeEvent())).toBe('&lt;b&gt;');
  });

  it('@checked resolves the checked state', () => {
    const el = document.createElement('input');
    el.type = 'checkbox';
    el.checked = true;
    expect(TokenHelper.resolve('@checked', el, makeEvent())).toBe(true);
  });

  it('@selected resolves the selected state', () => {
    const select = document.createElement('select');
    const option = document.createElement('option');
    option.selected = true;
    select.appendChild(option);
    expect(TokenHelper.resolve('@selected', option, makeEvent())).toBe(true);
  });

  it('@textContent resolves escaped textContent', () => {
    const el = document.createElement('div');
    el.textContent = '<i>';
    expect(TokenHelper.resolve('@textContent', el, makeEvent())).toBe('&lt;i&gt;');
  });

  it('@textContent falls back to an empty string when el has no textContent', () => {
    expect(TokenHelper.resolve('@textContent', {}, makeEvent())).toBe('');
  });

  it('@innerText resolves escaped innerText', () => {
    const el = document.createElement('div');
    el.innerText = '<i>';
    expect(TokenHelper.resolve('@innerText', el, makeEvent())).toBe('&lt;i&gt;');
  });

  it('@innerText falls back to an empty string when el has no innerText', () => {
    expect(TokenHelper.resolve('@innerText', {}, makeEvent())).toBe('');
  });

  it('@html resolves escaped innerHTML', () => {
    const el = document.createElement('div');
    el.innerHTML = '<i>x</i>';
    expect(TokenHelper.resolve('@html', el, makeEvent())).toBe('&lt;i&gt;x&lt;/i&gt;');
  });

  it('@html falls back to an empty string when el has no innerHTML', () => {
    expect(TokenHelper.resolve('@html', {}, makeEvent())).toBe('');
  });

  it('@event resolves to the raw event object', () => {
    const ev = makeEvent();
    expect(TokenHelper.resolve('@event', document.createElement('div'), ev)).toBe(ev);
  });

  it('@target resolves to event.target', () => {
    const target = document.createElement('span');
    const ev = makeEvent({ target });
    expect(TokenHelper.resolve('@target', document.createElement('div'), ev)).toBe(target);
  });

  it('@x and @y resolve to clientX/clientY', () => {
    const ev = makeEvent({ clientX: 5, clientY: 6 });
    expect(TokenHelper.resolve('@x', document.createElement('div'), ev)).toBe(5);
    expect(TokenHelper.resolve('@y', document.createElement('div'), ev)).toBe(6);
  });

  it('@x and @y fall back to 0 when clientX/clientY are missing', () => {
    const ev = makeEvent({ clientX: undefined, clientY: undefined });
    expect(TokenHelper.resolve('@x', document.createElement('div'), ev)).toBe(0);
    expect(TokenHelper.resolve('@y', document.createElement('div'), ev)).toBe(0);
  });

  it('@key and @code resolve to escaped keyboard event properties', () => {
    const ev = makeEvent({ key: '<', code: 'KeyA' });
    expect(TokenHelper.resolve('@key', document.createElement('div'), ev)).toBe('&lt;');
    expect(TokenHelper.resolve('@code', document.createElement('div'), ev)).toBe('KeyA');
  });

  it('@key and @code fall back to an empty string when key/code are missing', () => {
    const ev = makeEvent({ key: undefined, code: undefined });
    expect(TokenHelper.resolve('@key', document.createElement('div'), ev)).toBe('');
    expect(TokenHelper.resolve('@code', document.createElement('div'), ev)).toBe('');
  });

  it('@attr: resolves an escaped attribute value', () => {
    const el = document.createElement('div');
    el.setAttribute('title', '<t>');
    expect(TokenHelper.resolve('@attr:title', el, makeEvent())).toBe('&lt;t&gt;');
  });

  it('@attr: falls back to an empty string when the attribute is missing', () => {
    const el = document.createElement('div');
    expect(TokenHelper.resolve('@attr:title', el, makeEvent())).toBe('');
  });

  it('@dataset: resolves an escaped dataset value', () => {
    const el = document.createElement('div');
    el.dataset.foo = '<f>';
    expect(TokenHelper.resolve('@dataset:foo', el, makeEvent())).toBe('&lt;f&gt;');
  });

  it('@dataset: falls back to an empty string when the dataset key is missing', () => {
    const el = document.createElement('div');
    expect(TokenHelper.resolve('@dataset:foo', el, makeEvent())).toBe('');
  });

  it('resolves a double-quoted string literal', () => {
    expect(TokenHelper.resolve('"hello"', document.createElement('div'), makeEvent())).toBe('hello');
  });

  it('resolves a single-quoted string literal', () => {
    expect(TokenHelper.resolve("'hello'", document.createElement('div'), makeEvent())).toBe('hello');
  });

  it('resolves a number literal', () => {
    expect(TokenHelper.resolve('42', document.createElement('div'), makeEvent())).toBe(42);
  });

  it('falls back to the raw token string when nothing else matches', () => {
    expect(TokenHelper.resolve('unknownToken', document.createElement('div'), makeEvent())).toBe('unknownToken');
  });

  it('registerCustomToken adds a resolvable exact token', () => {
    TokenHelper.registerCustomToken('@custom', (el) => `custom:${el.tagName}`);
    const el = document.createElement('span');
    expect(TokenHelper.resolve('@custom', el, makeEvent())).toBe('custom:SPAN');
  });

  it('registerPrefixedToken adds a resolvable prefixed token', () => {
    TokenHelper.registerPrefixedToken('@upper:', (suffix) => suffix.toUpperCase());
    expect(TokenHelper.resolve('@upper:hi', document.createElement('div'), makeEvent())).toBe('HI');
  });
});
