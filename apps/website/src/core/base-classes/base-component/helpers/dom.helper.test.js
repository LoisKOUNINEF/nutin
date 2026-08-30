import { DomHelper } from '#root/dist/src/core/base-classes/base-component/helpers/dom.helper.js';

describe('DomHelper', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'mount-target';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    container = null;
  });

  it('mountElement appends the element into a string selector target', () => {
    const el = document.createElement('span');
    DomHelper.mountElement(el, '#mount-target');
    expect(container.contains(el)).toBe(true);
  });

  it('mountElement does nothing when the string selector target is not found', () => {
    const el = document.createElement('span');
    DomHelper.mountElement(el, '#does-not-exist');
    expect(el.parentElement).toBe(null);
  });

  it('mountElement replaces an HTMLElement target with the element', () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    container.appendChild(placeholder);

    const el = document.createElement('span');
    el.className = 'replacement';
    DomHelper.mountElement(el, placeholder);

    expect(container.contains(placeholder)).toBe(false);
    expect(container.contains(el)).toBe(true);
  });

  it('createElement creates an element with the given tag name', () => {
    const el = DomHelper.createElement('section');
    expect(el.tagName).toBe('SECTION');
  });

  it('createElement sets sanitized innerHTML from the template', () => {
    const el = DomHelper.createElement('div', '<p>hi</p><script>alert(1)</script>');
    expect(el.innerHTML).toBe('<p>hi</p>');
  });

  it('createElement respects the trustLevel when sanitizing', () => {
    const template = '<script>alert(1)</script>';
    const el = DomHelper.createElement('div', template, 'trusted');
    expect(el.innerHTML).toBe(template);
  });

  it('cleanupOptionalContent removes an optional img with no src', () => {
    container.innerHTML = '<img data-optional>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('img')).toBe(null);
  });

  it('cleanupOptionalContent keeps an optional img that has a src', () => {
    container.innerHTML = '<img data-optional src="pic.png">';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('img')).toBeDefined();
  });

  it('cleanupOptionalContent removes an optional input with no value', () => {
    container.innerHTML = '<input data-optional>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('input')).toBe(null);
  });

  it('cleanupOptionalContent keeps an optional input that has a value', () => {
    container.innerHTML = '<input data-optional value="hi">';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('input')).toBeDefined();
  });

  it('cleanupOptionalContent removes an optional textarea with no value', () => {
    container.innerHTML = '<textarea data-optional></textarea>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('textarea')).toBe(null);
  });

  it('cleanupOptionalContent removes an optional source element with no src', () => {
    container.innerHTML = '<video><source data-optional></video>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('source')).toBe(null);
  });

  it('cleanupOptionalContent keeps an optional source element that has a src', () => {
    container.innerHTML = '<video><source data-optional src="movie.mp4"></video>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('source')).toBeDefined();
  });

  it('cleanupOptionalContent removes an optional element with empty textContent', () => {
    container.innerHTML = '<span data-optional>   </span>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('span')).toBe(null);
  });

  it('cleanupOptionalContent removes an optional element whose textContent is the literal string "undefined"', () => {
    container.innerHTML = '<span data-optional>undefined</span>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('span')).toBe(null);
  });

  it('cleanupOptionalContent keeps an optional element with real textContent', () => {
    container.innerHTML = '<span data-optional>hello</span>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelector('span')).toBeDefined();
  });

  it('cleanupOptionalContent removes an element whose data-optional value is the literal string "undefined" or "null"', () => {
    container.innerHTML = `
      <span data-optional="undefined">has content</span>
      <span data-optional="null">has content</span>
    `;
    DomHelper.cleanupOptionalContent();
    expect(container.querySelectorAll('span').length).toBe(0);
  });

  it('cleanupOptionalContent keeps an element with data-optional="" and non-empty content — a bare/empty data-optional is a plain marker deferred to isEmpty(el), not a forced-removal signal', () => {
    container.innerHTML = '<span data-optional="">has content</span>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelectorAll('span').length).toBe(1);
  });

  it('cleanupOptionalContent removes an element whose data-optional value is whitespace-only, even with real content', () => {
    container.innerHTML = '<span data-optional="   ">has content</span>';
    DomHelper.cleanupOptionalContent();
    expect(container.querySelectorAll('span').length).toBe(0);
  });

  it('cleanupOptionalContent always strips the data-optional attribute from surviving elements', () => {
    container.innerHTML = '<span data-optional>hello</span>';
    DomHelper.cleanupOptionalContent();
    const span = container.querySelector('span');
    expect(span.hasAttribute('data-optional')).toBe(false);
  });
});
