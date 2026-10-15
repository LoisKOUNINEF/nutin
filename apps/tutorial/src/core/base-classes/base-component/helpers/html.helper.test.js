import { Component, View, html, raw, trustedRaw, SafeHtml } from '#root/dist/src/core/index.js';

class TestComponent extends Component {
  constructor(options = {}) {
    super(options);
  }

  _remove() {
    this.removed = true;
  }
}

class TestView extends View {
  constructor(template) {
    super({ template, viewName: 'html-test' });
  }
}

describe('html', () => {
  let app;

  beforeEach(() => {
    app = document.getElementById('app');
  });

  afterEach(() => {
    app.innerHTML = '';
    app = null;
  });

  it('html returns a SafeHtml whose toString is the markup', () => {
    const result = html`<p>hi</p>`;
    expect(result instanceof SafeHtml).toBe(true);
    expect(String(result)).toBe('<p>hi</p>');
  });

  it('html escapes interpolated strings', () => {
    expect(String(html`<p>${'<b class="x">a & \'b\'</b>'}</p>`))
      .toBe('<p>&lt;b class=&quot;x&quot;&gt;a &amp; &#039;b&#039;&lt;/b&gt;</p>');
  });

  it('html escapes quotes so a value cannot break out of an attribute', () => {
    const value = '" autofocus onfocus="alert(1)';
    expect(String(html`<input value="${value}">`))
      .toBe('<input value="&quot; autofocus onfocus=&quot;alert(1)">');
  });

  it('html stringifies numbers and true, and renders null, undefined and false as empty', () => {
    expect(String(html`${1}|${true}|${null}|${undefined}|${false}|${0}`)).toBe('1|true||||0');
  });

  it('html keeps null and undefined as literal strings in a data-optional value only', () => {
    expect(String(html`<p data-optional="${undefined}">a</p>`)).toBe('<p data-optional="undefined">a</p>');
    expect(String(html`<p data-optional='${null}'>a</p>`)).toBe(`<p data-optional='null'>a</p>`);
    expect(String(html`<p data-optional=${undefined}>a</p>`)).toBe('<p data-optional="undefined">a</p>');
    expect(String(html`<p data-optional="${'x'}" title="${undefined}">${undefined}</p>`)).toBe('<p data-optional="x" title=""></p>');
  });

  it('data-optional="${value}" removes the element when value is undefined, even with other content', () => {
    const component = new TestComponent({
      config: {},
      templateFn: (cfg) => html`<div><h3 data-optional="${cfg.title}">• ${cfg.title}</h3><p data-optional="${'kept'}">• kept</p></div>`,
    });

    component.render();

    expect(component.getElement().querySelector('h3')).toBe(null);
    expect(component.getElement().querySelector('p').textContent).toBe('• kept');
  });

  it('html inserts nested html results without escaping them again', () => {
    const inner = html`<b>${'<i>'}</b>`;
    expect(String(html`<p>${inner}</p>`)).toBe('<p><b>&lt;i&gt;</b></p>');
  });

  it('html joins arrays item by item, escaping strings and keeping SafeHtml', () => {
    const items = ['<a>', 'b'].map((item) => html`<li>${item}</li>`);
    expect(String(html`<ul>${items}${['<c>']}</ul>`)).toBe('<ul><li>&lt;a&gt;</li><li>b</li>&lt;c&gt;</ul>');
  });

  it('raw inserts markup unescaped and renders null and undefined as empty', () => {
    expect(String(html`<div>${raw('<em>x</em>')}</div>`)).toBe('<div><em>x</em></div>');
    expect(String(raw(null))).toBe('');
    expect(String(raw(undefined))).toBe('');
  });

  it('raw keeps a plain attribute fragment unchanged', () => {
    expect(String(html`<a ${raw('aria-current="page"')}>x</a>`)).toBe('<a aria-current="page">x</a>');
  });

  it('raw strips binding attributes so injected markup cannot call component methods', () => {
    const component = new TestComponent({
      config: { body: '<button class="evil" data-event="click:_remove">x</button>' },
      templateFn: (cfg) => html`<div>${raw(cfg.body)}</div>`,
    });

    component.render();
    const button = component.getElement().querySelector('button.evil');
    button.click();

    expect(button.hasAttribute('data-event')).toBe(false);
    expect(component.removed).toBe(undefined);
  });

  it('raw content is parsed in its parent context and stripped there (svg)', () => {
    const component = new TestComponent({
      templateFn: () => html`<svg>${raw('<style><button class="hidden" data-event="click:_remove">x</button></style>')}</svg>`,
    });

    component.render();
    component.getElement().querySelectorAll('[class="hidden"], button').forEach((el) => el.dispatchEvent(new Event('click')));

    expect(component.getElement().querySelector('[data-event]')).toBe(null);
    expect(component.removed).toBe(undefined);
  });

  it('raw content is parsed in its parent context (table)', () => {
    const component = new TestComponent({
      templateFn: () => html`<table>${raw('<tr><td>cell</td></tr>')}</table>`,
    });

    component.render();

    expect(component.getElement().querySelector('table td').textContent).toBe('cell');
    expect(component.getElement().querySelector('template')).toBe(null);
  });

  it('raw content inside nested html and arrays is resolved', () => {
    const items = ['<b>1</b>', '<b>2</b>'].map((item) => html`<li>${raw(item)}</li>`);
    const component = new TestComponent({ templateFn: () => html`<ul>${items}</ul>` });

    component.render();

    expect(component.getElement().innerHTML).toBe('<ul><li><b>1</b></li><li><b>2</b></li></ul>');
  });

  it('raw content is sanitized at the component trust level', () => {
    const component = new TestComponent({
      templateFn: () => html`<div>${raw('<img src="x.png" onerror="x()"><script>x()</script>')}</div>`,
    });

    component.render();

    expect(component.getElement().innerHTML).toBe('<div><img src="x.png"></div>');
  });

  it('String() of html with raw inlines the raw markup without bindings', () => {
    expect(String(html`<p>${raw('<b data-event="click:_x">b</b>')}</p>`)).toBe('<p><b>b</b></p>');
  });

  it('raw at the top level and inside an HTML template is resolved', () => {
    const component = new TestComponent({
      templateFn: () => html`${raw('<b data-event="click:_remove">top</b>')}<template>${raw('<i>in</i>')}</template>`,
    });

    component.render();
    const el = component.getElement();

    expect(el.querySelector('b').outerHTML).toBe('<b>top</b>');
    expect(el.querySelector('template').content.querySelector('i').textContent).toBe('in');
  });

  it('raw inside an svg template is parsed as svg', () => {
    const component = new TestComponent({
      templateFn: () => html`<svg><template>${raw('<text>t</text>')}</template></svg>`,
    });

    component.render();

    expect(component.getElement().querySelector('svg text').namespaceURI).toBe('http://www.w3.org/2000/svg');
  });

  it('a placeholder without a matching raw source is removed', () => {
    const component = new TestComponent({
      templateFn: () => html`${trustedRaw('<template data-nutin-raw="missing"></template>')}<p>x</p>`,
    });

    component.render();

    expect(component.getElement().innerHTML).toBe('<p>x</p>');
  });

  it('trustedRaw keeps binding attributes', () => {
    const component = new TestComponent({
      templateFn: () => html`<div>${trustedRaw('<button class="own" data-event="click:_remove">x</button>')}</div>`,
    });

    component.render();
    component.getElement().querySelector('button.own').click();

    expect(component.removed).toBe(true);
  });

  it('trustedRaw renders null and undefined as empty', () => {
    expect(String(trustedRaw(null))).toBe('');
    expect(String(trustedRaw(undefined))).toBe('');
  });

  it('html quotes a value in an unquoted attribute so it stays one attribute', () => {
    expect(String(html`<div title=${'a data-event=click:_remove'}>t</div>`))
      .toBe('<div title="a data-event=click:_remove">t</div>');
    expect(String(html`<div title=${''} id="x">t</div>`)).toBe('<div title="" id="x">t</div>');
  });

  it('html encodes terminators inside an unquoted value that is already started', () => {
    expect(String(html`<div class=a${' b=c'}>t</div>`)).toBe('<div class=a&#32;b&#61;c>t</div>');
  });

  it('html quotes nested html results in unquoted attributes too', () => {
    expect(String(html`<div title=${html`a ${'b'}`}>t</div>`)).toBe('<div title="a b">t</div>');
  });

  it('html leaves "=" in text and quoted attributes alone', () => {
    expect(String(html`<p>Total = ${5}</p><a title="${'x y'}">l</a>`)).toBe('<p>Total = 5</p><a title="x y">l</a>');
  });

  it('raw in attribute position keeps plain attributes and drops handlers, bindings and script URLs', () => {
    const attrs = 'checked aria-label="ok" onclick="x()" data-event="click:_remove" href="javascript:x()" srcdoc="x"';
    expect(String(html`<input ${raw(attrs)}>`)).toBe('<input checked="" aria-label="ok">');
  });

  it('html tracks single-quoted, spaced and empty unquoted attributes', () => {
    expect(String(html`<a title='${"x'y"}' id=${'i d'}>t</a>`)).toBe('<a title=\'x&#039;y\' id="i d">t</a>');
    expect(String(html`<a title= ${'v w'}>t</a>`)).toBe('<a title= "v w">t</a>');
    expect(String(html`<a title=>${'<t>'}</a>`)).toBe('<a title=>&lt;t&gt;</a>');
  });

  it('html returns to text and tag states after an unquoted value', () => {
    expect(String(html`<a class=x>${'a b'}</a>`)).toBe('<a class=x>a b</a>');
    expect(String(html`<a class=x title=${'v w'}>t</a>`)).toBe('<a class=x title="v w">t</a>');
  });

  it('html keeps plain attributes interpolated in tag position', () => {
    expect(String(html`<input ${true ? 'disabled' : ''}>`)).toBe('<input disabled="">');
    expect(String(html`<input ${'aria-label="ok"'}>`)).toBe('<input aria-label="ok">');
    expect(String(html`<input ${''}>`)).toBe('<input >');
  });

  it('html drops handlers, bindings and script URLs interpolated as a plain string in tag position', () => {
    expect(String(html`<div ${'data-event=click:_remove'}>x</div>`)).toBe('<div >x</div>');
    expect(String(html`<a ${'href=javascript:x() onclick=x()'}>x</a>`)).toBe('<a >x</a>');
  });

  it('a binding attribute injected in tag position cannot call a component method', () => {
    const component = new TestComponent({
      config: { attrs: 'data-event=click:_remove' },
      templateFn: (cfg) => html`<button ${cfg.attrs}>x</button>`,
    });

    component.render();
    component.getElement().querySelector('button').click();

    expect(component.removed).toBe(undefined);
  });

  it('raw in an attribute value position is escaped as text', () => {
    expect(String(html`<a title="${raw('<b>"q"</b>')}">t</a>`)).toBe('<a title="&lt;b&gt;&quot;q&quot;&lt;/b&gt;">t</a>');
  });

  it('raw in attribute position with an unterminated quote yields no attributes', () => {
    expect(String(html`<b ${raw('a="x')}>t</b>`)).toBe('<b >t</b>');
  });

  it('raw in attribute position drops attributes with invalid names', () => {
    expect(String(html`<b ${raw('a"b="1" ok="2"')}>t</b>`)).toBe('<b ok="2">t</b>');
  });

  it('a component templateFn using html renders injected markup as text', () => {
    const payload = '<button class="evil" data-event="click:_remove">x</button>';
    const component = new TestComponent({
      config: { name: payload },
      templateFn: (cfg) => html`<span>${cfg.name}</span>`,
    });

    component.render();

    expect(component.getElement().querySelector('button')).toBe(null);
    expect(component.getElement().querySelector('span').textContent).toBe(payload);
  });

  it('a view accepts an html template', () => {
    const view = new TestView(html`<h1>${'<Title>'}</h1>`);

    view.render();

    expect(view.getElement().querySelector('h1').textContent).toBe('<Title>');
  });
});
