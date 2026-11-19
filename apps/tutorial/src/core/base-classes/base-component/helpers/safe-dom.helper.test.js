import * as SafeDom from '#root/dist/src/core/base-classes/base-component/helpers/safe-dom.helper.js';

// In a browser, a <form>'s named controls (and named <img>/<form>/... on document) shadow
// built-in properties. jsdom doesn't do that, so each test shadows them by hand.
describe('SafeDom', () => {
  function formShadowing(names) {
    const form = document.createElement('form');
    form.setAttribute('id', 'real-id');
    form.setAttribute('name', 'real-name');
    form.setAttribute('class', 'real-class');
    form.setAttribute('data-x', 'real-x');
    form.innerHTML = '<span>text</span>';
    const control = document.createElement('input');
    names.forEach((name) => Object.defineProperty(form, name, { configurable: true, value: control }));
    return { form, control };
  }

  it('reads attributes, localName and tagName of a form past shadowing controls', () => {
    const { form } = formShadowing(['attributes', 'localName', 'tagName', 'namespaceURI']);
    expect(SafeDom.attributesOf(form).length).toBe(4);
    expect(SafeDom.localNameOf(form)).toBe('form');
    expect(SafeDom.tagNameOf(form)).toBe('FORM');
    expect(SafeDom.namespaceOf(form)).toBe('http://www.w3.org/1999/xhtml');
  });

  it('calls attribute methods of a form past shadowing controls', () => {
    const { form } = formShadowing(['getAttribute', 'hasAttribute', 'setAttribute', 'removeAttribute']);
    expect(SafeDom.getAttr(form, 'id')).toBe('real-id');
    expect(SafeDom.hasAttr(form, 'name')).toBe(true);
    SafeDom.setAttr(form, 'action', '/go');
    SafeDom.removeAttr(form, 'class');
    expect(Element.prototype.getAttribute.call(form, 'action')).toBe('/go');
    expect(Element.prototype.hasAttribute.call(form, 'class')).toBe(false);
  });

  it('reads id, name, className, dataset, text and markup of a form past shadowing controls', () => {
    const { form } = formShadowing(['id', 'name', 'className', 'dataset', 'textContent', 'innerHTML']);
    expect(SafeDom.idOf(form)).toBe('real-id');
    expect(SafeDom.nameOf(form)).toBe('real-name');
    expect(SafeDom.classNameOf(form)).toBe('real-class');
    expect(SafeDom.datasetOf(form).x).toBe('real-x');
    expect(SafeDom.textOf(form)).toBe('text');
    expect(SafeDom.innerHtmlOf(form)).toBe('<span>text</span>');
    SafeDom.setText(form, 'new');
    expect(Node.prototype.hasChildNodes.call(form) && form.firstChild.nodeValue).toBe('new');
  });

  it('walks tree links of a form past shadowing controls', () => {
    const parent = document.createElement('div');
    const { form } = formShadowing(['parentElement', 'parentNode', 'childNodes', 'querySelectorAll', 'remove']);
    parent.appendChild(form);
    expect(SafeDom.parentElementOf(form)).toBe(parent);
    expect(SafeDom.parentNodeOf(form)).toBe(parent);
    expect(SafeDom.childNodesOf(form).length).toBe(1);
    expect(SafeDom.querySelectorAllOf(form, 'span').length).toBe(1);
    SafeDom.removeNode(form);
    expect(parent.childElementCount).toBe(0);
  });

  it('adds and removes listeners on a form past shadowing controls', () => {
    const { form } = formShadowing(['addEventListener', 'removeEventListener']);
    let calls = 0;
    const listener = () => { calls++; };
    SafeDom.addListener(form, 'submit', listener);
    form.dispatchEvent(new window.Event('submit'));
    SafeDom.removeListener(form, 'submit', listener);
    form.dispatchEvent(new window.Event('submit'));
    expect(calls).toBe(1);
  });

  it('templateContentOf returns a template\'s content, and null for a form with a control named content or an svg <template>', () => {
    const template = document.createElement('template');
    template.innerHTML = '<b>b</b>';
    const { form } = formShadowing(['content']);
    const svgTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'template');
    expect(SafeDom.templateContentOf(template).firstChild.localName).toBe('b');
    expect(SafeDom.templateContentOf(form)).toBe(null);
    expect(SafeDom.templateContentOf(svgTemplate)).toBe(null);
  });

  it('createElementIn and prop read document past a shadowing named element', () => {
    const shadow = document.createElement('img');
    ['createElement', 'body'].forEach((name) => Object.defineProperty(document, name, { configurable: true, value: shadow }));
    try {
      expect(SafeDom.createElementIn(document, 'p').localName).toBe('p');
      expect(SafeDom.prop(document, 'body').localName).toBe('body');
    } finally {
      delete document.createElement;
      delete document.body;
    }
  });

  it('reads plain properties of other nodes, so environment stubs (no layout, no innerText in jsdom) still apply', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'scrollTop', { value: 12, writable: true });
    div.innerText = 'stubbed';
    expect(SafeDom.scrollOf(div).top).toBe(12);
    expect(SafeDom.innerTextOf(div)).toBe('stubbed');
    expect(SafeDom.nameOf(div)).toBe('');
  });

  it('querySelectorAllOf works on a DocumentFragment and returns an array', () => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createElement('i'), document.createElement('i'));
    const found = SafeDom.querySelectorAllOf(fragment, 'i');
    expect(Array.isArray(found)).toBe(true);
    expect(found.length).toBe(2);
  });

  it('assign writes through the built-in setter on a form, and invoke throws on a missing method', () => {
    const { form } = formShadowing(['innerHTML']);
    SafeDom.assign(form, 'innerHTML', '');
    expect(form.childNodes.length).toBe(0);
    expect(() => SafeDom.invoke(form, 'noSuchMethod')).toThrow();
  });
});
