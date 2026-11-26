import { Component, View, html, raw, trustedRaw, nutinIf, nutinFor, SafeHtml } from '#root/dist/src/core/index.js';

class TestComponent extends Component {
  constructor(options = {}) {
    super(options);
  }

  _remove() {
    this.removed = true;
  }
}

class PickComponent extends Component {
  constructor(options = {}) {
    super(options);
    this.picked = [];
  }

  _pick(id) {
    this.picked.push(id);
  }
}

// The rendered innerHTML of a component whose templateFn is the given function.
function renderedHtml(templateFn) {
  const component = new TestComponent({ templateFn });
  component.render();
  const out = component.getElement().innerHTML;
  component.destroy();
  return out;
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

  it('html replaces a javascript: URL from data in a URL attribute and warns', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const bad = 'javascript:alert(1)';
      const results = [
        String(html`<a href="${bad}">x</a>`),
        String(html`<a href='${bad}'>x</a>`),
        String(html`<a href=${bad}>x</a>`),
        String(html`<a href=" ${bad}">x</a>`),
        String(html`<a HREF="${'java\tscript:x'}">x</a>`),
        String(html`<a href="${'JavaScript:x'}">x</a>`),
        String(html`<button formaction="${bad}">x</button>`),
        String(html`<svg><a xlink:href="${bad}">x</a></svg>`),
        String(html`<a href="${html`${bad}`}">x</a>`),
        String(html`<a href="${raw(bad)}">x</a>`),
        String(html`<a href="${'java'}${'script:x'}">x</a>`),
      ];

      expect(results).toEqual([
        '<a href="about:invalid#nutin-blocked">x</a>',
        "<a href='about:invalid#nutin-blocked'>x</a>",
        '<a href="about:invalid#nutin-blocked">x</a>',
        '<a href=" about:invalid#nutin-blocked">x</a>',
        '<a HREF="about:invalid#nutin-blocked">x</a>',
        '<a href="about:invalid#nutin-blocked">x</a>',
        '<button formaction="about:invalid#nutin-blocked">x</button>',
        '<svg><a xlink:href="about:invalid#nutin-blocked">x</a></svg>',
        '<a href="about:invalid#nutin-blocked">x</a>',
        '<a href="about:invalid#nutin-blocked">x</a>',
        '<a href="javaabout:invalid#nutin-blocked">x</a>',
      ]);
      expect(warnSpy.callCount).toBe(11);
    } finally {
      warnSpy.restore();
    }
  });

  it('html gives the same result each time one template literal is called with new values', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const link = (href, label, title) => html`<a href="${href}" title=${title}>${label}</a>`;
      const results = [
        String(link('/a', '<b>', 'x y')),
        String(link('javascript:x', 'b', undefined)),
        String(link('/c', html`<i>c</i>`, 't')),
      ];

      expect(results).toEqual([
        '<a href="/a" title="x y">&lt;b&gt;</a>',
        '<a href="about:invalid#nutin-blocked" title="">b</a>',
        '<a href="/c" title="t"><i>c</i></a>',
      ]);
      expect(warnSpy.callCount).toBe(1);
    } finally {
      warnSpy.restore();
    }
  });

  it('html checks a URL built from several values with static text between them as one value', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const url = (a, b, c) => html`<a href="${a}:${b}" title="${c}">x</a><a href="${c}">y</a>`;
      const results = [
        String(url('javascript', 'x', 'ok')),
        String(url('https', '//example.com', '/ok')),
        String(url('/p', 'javascript:x', 'javascript:x')),
      ];

      expect(results).toEqual([
        '<a href="javascript:about:invalid#nutin-blocked" title="ok">x</a><a href="ok">y</a>',
        '<a href="https://example.com" title="/ok">x</a><a href="/ok">y</a>',
        '<a href="/p:javascript:x" title="javascript:x">x</a><a href="about:invalid#nutin-blocked">y</a>',
      ]);
      expect(warnSpy.callCount).toBe(2);
    } finally {
      warnSpy.restore();
    }
  });

  it('a javascript: URL from data is blocked at the trusted level too', () => {
    const component = new TestComponent({
      config: { url: 'javascript:alert(1)' },
      templateFn: (cfg) => html`<a href="${cfg.url}">x</a>`,
      trustLevel: 'trusted',
    });

    silenceConsole('warn', () => component.render());

    expect(component.getElement().querySelector('a').getAttribute('href')).toBe('about:invalid#nutin-blocked');
  });

  it('html keeps URLs whose scheme is fixed by the template, other schemes and non-URL attributes', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const results = [
        String(html`<a href="/p/${'javascript:x'}">x</a>`),
        String(html`<a href="#${'javascript:x'}">x</a>`),
        String(html`<a href="${'https://example.com/a'}">x</a>`),
        String(html`<a title="${'javascript:x'}" data-x=${'javascript:x'}>x</a>`),
        String(html`<a href="javascript:go(${1})">x</a>`),
        String(html`<a title="t"href="${'/ok'}">x</a>`),
      ];

      expect(results).toEqual([
        '<a href="/p/javascript:x">x</a>',
        '<a href="#javascript:x">x</a>',
        '<a href="https://example.com/a">x</a>',
        '<a title="javascript:x" data-x="javascript:x">x</a>',
        '<a href="javascript:go(1)">x</a>',
        '<a title="t"href="/ok">x</a>',
      ]);
      expect(warnSpy.callCount).toBe(0);
    } finally {
      warnSpy.restore();
    }
  });

  it('raw in a textarea or title is inserted as text, with entities decoded', () => {
    app.innerHTML = String(html`<textarea>${raw('<b>Tom &amp; Jerry</b>')}</textarea>`);
    expect(app.querySelector('textarea').value).toBe('<b>Tom & Jerry</b>');

    const fragment = String(html`<TITLE>${raw('<i>t</i>')}</TITLE>`);
    expect(fragment).toBe('<TITLE>&lt;i>t&lt;/i></TITLE>');
  });

  it('raw in a textarea cannot close it, in String() and at render', () => {
    const payload = '</textarea><img src="x" onerror="x()">';
    expect(String(html`<textarea>${raw(payload)}</textarea>`))
      .toBe('<textarea>&lt;/textarea>&lt;img src="x" onerror="x()"></textarea>');

    const component = new TestComponent({ templateFn: () => html`<div><textarea>${raw(payload)}</textarea></div>` });
    component.render();

    expect(component.getElement().querySelector('img')).toBe(null);
    expect(component.getElement().querySelector('textarea').value).toBe(payload);
  });

  it('nested html and trustedRaw in a textarea are kept as they are, raws inside nested html become text', () => {
    expect(String(html`<title>${html`${'Tom & Jerry'} - Site`}</title>`)).toBe('<title>Tom &amp; Jerry - Site</title>');
    expect(String(html`<textarea>${trustedRaw('a &amp; b')}</textarea>`)).toBe('<textarea>a &amp; b</textarea>');
    expect(String(html`<textarea>${[html`<b>${raw('<i>$&</i>')}</b>`, 'x', null]}</textarea>`))
      .toBe('<textarea><b>&lt;i>$&&lt;/i></b>x</textarea>');
  });

  it('html tracks the end of a textarea: tag position on it and raw after it work as usual', () => {
    const result = html`<textarea ${raw('rows="3" onclick="x()"')}>a</textarea >${raw('<b>b</b>')}`;

    expect(/^<textarea rows="3">a<\/textarea ><template data-nutin-raw="r\d+"><\/template>$/.test(result.value)).toBe(true);
    expect(result.raws.size).toBe(1);
  });

  it('a raw after a textarea is resolved as nodes at render', () => {
    const component = new TestComponent({
      templateFn: () => html`<div><textarea>a < b</textarea>${raw('<b>bold</b>')}</div>`,
    });
    component.render();

    expect(component.getElement().innerHTML).toBe('<div><textarea>a &lt; b</textarea><b>bold</b></div>');
  });

  it('String() of a raw containing $ patterns keeps them literally', () => {
    expect(String(html`<p>${raw('cost: $& $1')}</p>`)).toBe('<p>cost: $&amp; $1</p>');
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

  it('raw returned directly from a template is parsed in place, stripped of bindings and sanitized', () => {
    const component = new TestComponent({
      templateFn: () => raw('<button class="evil" data-event="click:_remove">x</button><script>x()</script>'),
    });

    component.render();
    const button = component.getElement().querySelector('button.evil');
    button.click();

    expect(component.getElement().innerHTML).toBe('<button class="evil">x</button>');
    expect(component.removed).toBe(undefined);
  });

  it('raw returned directly from a template is stripped of bindings at the trusted level too', () => {
    const component = new TestComponent({
      templateFn: () => raw('<b data-event="click:_remove">x</b>'),
      trustLevel: 'trusted',
    });

    component.render();

    expect(component.getElement().innerHTML).toBe('<b>x</b>');
  });

  it('two raws in one template keep their own content', () => {
    expect(String(html`<p>${raw('<b>1</b>')}${raw('<i>2</i>')}</p>`)).toBe('<p><b>1</b><i>2</i></p>');
    const component = new TestComponent({ templateFn: () => html`<p>${raw('<b>1</b>')}${raw('<i>2</i>')}</p>` });

    component.render();

    expect(component.getElement().innerHTML).toBe('<p><b>1</b><i>2</i></p>');
  });

  it('nutinIf returns the branch when true and renders empty when false', () => {
    expect(String(nutinIf(true, 'a'))).toBe('a');
    expect(String(nutinIf(false, 'a'))).toBe('');
    expect(String(html`<p>${nutinIf(true, 'a')}|${nutinIf(false, 'b')}</p>`)).toBe('<p>a|</p>');
  });

  it('nutinElse renders the taken branch, inline and returned directly', () => {
    const a = () => html`<b>a</b>`;
    const b = () => html`<i>b</i>`;

    expect(String(nutinIf(true, a()).nutinElse(b()))).toBe('<b>a</b>');
    const elseBranch = b();
    expect(nutinIf(false, a()).nutinElse(elseBranch)).toBe(elseBranch);
    expect(String(nutinIf(false, a()).nutinElse(b()))).toBe('<i>b</i>');
    expect(nutinIf(false, a()).nutinElse('b')).toBe('b');
    expect(renderedHtml(() => html`<p>${nutinIf(true, a()).nutinElse(b())}</p>`)).toBe('<p><b>a</b></p>');
    expect(renderedHtml(() => nutinIf(true, a()).nutinElse(b()))).toBe('<b>a</b>');
  });

  it('an array branch with nutinElse returned directly renders its items, not a comma-joined string', () => {
    expect(renderedHtml(() => nutinIf(true, ['<b>', html`<i>x</i>`, raw('<u>u</u>')]).nutinElse('none')))
      .toBe('&lt;b&gt;<i>x</i><u>u</u>');
  });

  it('nutinIf calls only the thunk of the branch taken', () => {
    let ifCalls = 0;
    let elseCalls = 0;
    const ifBranch = () => { ifCalls++; return 'a'; };
    const elseBranch = () => { elseCalls++; return 'b'; };

    expect(String(nutinIf(true, ifBranch).nutinElse(elseBranch))).toBe('a');
    expect(String(nutinIf(false, ifBranch).nutinElse(elseBranch))).toBe('b');
    expect(String(nutinIf(false, ifBranch))).toBe('');

    expect(ifCalls).toBe(1);
    expect(elseCalls).toBe(1);
  });

  it('a nutinIf branch renders the same DOM as the value written in place, in either position', () => {
    const markup = '<button class="b" data-event="click:_remove">x</button>';
    const branches = {
      string: () => markup,
      html: () => html`<button class="b" data-event="click:_remove">${'<x>'}</button>`,
      raw: () => raw(markup),
      trustedRaw: () => trustedRaw(markup),
    };
    const contexts = {
      inline: (value) => () => html`<div>${value()}</div>`,
      top: (value) => value,
    };
    const render = (templateFn) => {
      const component = new TestComponent({ templateFn });
      component.render();
      const out = component.getElement().innerHTML;
      component.destroy();
      return out;
    };

    for (const [kind, branch] of Object.entries(branches)) {
      for (const [where, wrap] of Object.entries(contexts)) {
        const expected = render(wrap(branch));
        const asIf = render(wrap(() => nutinIf(true, branch()).nutinElse('no')));
        const asIfThunk = render(wrap(() => nutinIf(true, branch)));
        const asElse = render(wrap(() => nutinIf(false, 'no').nutinElse(branch())));
        const asElseThunk = render(wrap(() => nutinIf(false, 'no').nutinElse(branch)));
        const unchained = render(wrap(() => nutinIf(true, branch())));

        expect([kind, where, asIf, asIfThunk, asElse, asElseThunk, unchained])
          .toEqual([kind, where, expected, expected, expected, expected, expected]);
      }
    }
  });

  it('a string branch is escaped inside html and is markup returned directly, like a string written there', () => {
    const inline = new TestComponent({ templateFn: () => html`<p>${nutinIf(true, '<b>x</b>')}</p>` });
    const top = new TestComponent({ templateFn: () => nutinIf(true, '<b>x</b>') });

    inline.render();
    top.render();

    expect(inline.getElement().innerHTML).toBe('<p>&lt;b&gt;x&lt;/b&gt;</p>');
    expect(top.getElement().innerHTML).toBe('<b>x</b>');
  });

  it('a raw branch loses its bindings and a trustedRaw branch keeps them, inside html and returned directly', () => {
    const markup = '<button class="b" data-event="click:_remove">x</button>';
    const templates = [
      [() => html`<div>${nutinIf(true, raw(markup))}</div>`, undefined],
      [() => nutinIf(false, 'no').nutinElse(raw(markup)), undefined],
      [() => html`<div>${nutinIf(false, 'no').nutinElse(trustedRaw(markup))}</div>`, true],
      [() => nutinIf(true, trustedRaw(markup)), true],
    ];

    const removed = templates.map(([templateFn]) => {
      const component = new TestComponent({ templateFn });
      component.render();
      component.getElement().querySelector('button.b').click();
      component.destroy();
      return component.removed;
    });

    expect(removed).toEqual(templates.map(([, expected]) => expected));
  });

  it('a raw branch is parsed in its parent context (svg, table)', () => {
    const component = new TestComponent({
      templateFn: () => html`<svg>${nutinIf(true, raw('<text>t</text>'))}</svg><table>${nutinIf(false, '').nutinElse(raw('<tr><td>cell</td></tr>'))}</table>`,
    });

    component.render();

    expect(component.getElement().querySelector('svg text').namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(component.getElement().querySelector('table td').textContent).toBe('cell');
  });

  it('a nutinIf branch in tag position is filtered and in a URL attribute cannot add a javascript: URL', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      const results = [
        String(html`<input ${nutinIf(true, 'onclick="x()" title="t"')}>`),
        String(html`<input ${nutinIf(false, 'title="t"')}>`),
        String(html`<a href="${nutinIf(true, 'javascript:alert(1)')}">x</a>`),
        String(html`<a href="${nutinIf(false, '/a').nutinElse('javascript:alert(1)')}">x</a>`),
        String(html`<a href=${nutinIf(true, '/a b')}>x</a>`),
      ];

      expect(results).toEqual([
        '<input title="t">',
        '<input >',
        '<a href="about:invalid#nutin-blocked">x</a>',
        '<a href="about:invalid#nutin-blocked">x</a>',
        '<a href="/a b">x</a>',
      ]);
      expect(warnSpy.callCount).toBe(2);
    } finally {
      warnSpy.restore();
    }
  });

  it('a nutinIf branch in a textarea is text', () => {
    expect(String(html`<textarea>${nutinIf(true, raw('</textarea><b>'))}</textarea>`)).toBe('<textarea>&lt;/textarea>&lt;b></textarea>');
    expect(String(html`<textarea>${nutinIf(false, '').nutinElse('<b>')}</textarea>`)).toBe('<textarea>&lt;b&gt;</textarea>');
  });

  it('nutinIf warns in development when the condition is not a boolean', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    let results;
    try {
      results = [String(nutinIf(0, 'a')), String(nutinIf('yes', 'a')), String(nutinIf(true, 'a'))];
    } finally {
      warnSpy.restore();
    }

    expect(results).toEqual(['', 'a', 'a']);
    expect(warnSpy.callCount).toBe(2);
    expect(warnSpy.calls[0][0]).toContain('got number');
  });

  it('a branch that is not a Template renders as it would inside html, returned directly too', () => {
    const values = [null, undefined, 5, ['<b>', html`<i>x</i>`, raw('<u>u</u>')]];
    const render = (templateFn) => {
      const component = new TestComponent({ templateFn });
      component.render();
      const out = component.getElement().innerHTML;
      component.destroy();
      return out;
    };

    const top = values.map((value) => render(() => nutinIf(true, value)));
    const inline = values.map((value) => render(() => html`${nutinIf(true, value)}`));

    expect(top).toEqual(['', '', '5', '&lt;b&gt;<i>x</i><u>u</u>']);
    expect(inline).toEqual(top);
  });

  it('nutinIf chains as else-if through an else thunk and nests', () => {
    const pick = (a, b) => nutinIf(a, 'x').nutinElse(() => nutinIf(b, 'y').nutinElse('z'));

    expect([String(pick(true, true)), String(pick(false, true)), String(pick(false, false))]).toEqual(['x', 'y', 'z']);
    expect(String(html`<p>${pick(false, true)}</p>`)).toBe('<p>y</p>');
    expect(String(html`<p>${nutinIf(true, nutinIf(true, '<b>'))}</p>`)).toBe('<p>&lt;b&gt;</p>');
    expect(String(nutinIf(true, nutinIf(true, '<b>')))).toBe('<b>');
  });

  it('a false nutinIf in a data-optional value is an empty string, not a missing value', () => {
    const component = new TestComponent({
      templateFn: () => html`<p data-optional="${nutinIf(false, 'x')}">kept</p><p data-optional="${nutinIf(false, 'x')}"></p>`,
    });

    component.render();

    expect(component.getElement().innerHTML).toBe('<p>kept</p>');
  });

  it('nutinFor renders each item in order with its index', () => {
    const li = (item, index) => html`<li>${index}:${item}</li>`;

    expect(String(html`<ul>${nutinFor(['a', 'b', 'c'], li)}</ul>`)).toBe('<ul><li>0:a</li><li>1:b</li><li>2:c</li></ul>');
    expect(renderedHtml(() => nutinFor(['a', 'b'], li))).toBe('<li>0:a</li><li>1:b</li>');
  });

  it('nutinFor interpolates each item once, nested or not, inline or returned directly', () => {
    let reads = 0;
    // Interpolated as text: each read of its string form is one interpolation of the item.
    const counted = () => ({ toString: () => { reads++; return 'x'; } });

    expect(String(html`<ul>${nutinFor([1, 2], counted)}</ul>`)).toBe('<ul>xx</ul>');
    expect(reads).toBe(2);

    reads = 0;
    const nested = html`<ul>${nutinFor([1, 2], () => html`<li>${nutinFor([1, 2], () => nutinFor([1], counted))}</li>`)}</ul>`;
    expect(String(nested)).toBe('<ul><li>xx</li><li>xx</li></ul>');
    expect(reads).toBe(4);

    reads = 0;
    expect(renderedHtml(() => nutinFor([1, 2], counted))).toBe('xx');
    expect(reads).toBe(2);
  });

  it('nutinFor renders empty for an empty list, null and undefined, or the else branch', () => {
    const li = (item) => html`<li>${item}</li>`;

    expect([String(nutinFor([], li)), String(nutinFor(null, li)), String(nutinFor(undefined, li))]).toEqual(['', '', '']);
    expect(String(nutinFor([], li).nutinElse(html`<p>none</p>`))).toBe('<p>none</p>');
    expect(String(nutinFor(null, li).nutinElse('none'))).toBe('none');
    expect(renderedHtml(() => nutinFor([], li).nutinElse(html`<p>none</p>`))).toBe('<p>none</p>');
  });

  it('nutinFor calls the else thunk only when the list is empty', () => {
    let elseCalls = 0;
    const none = () => { elseCalls++; return 'none'; };

    expect(String(nutinFor(['a'], (item) => item).nutinElse(none))).toBe('a');
    expect(String(nutinFor([], (item) => item).nutinElse(none))).toBe('none');

    expect(elseCalls).toBe(1);
  });

  it('a non-empty nutinFor with nutinElse renders its items, inline and returned directly', () => {
    const li = (item) => html`<li>${item}</li>`;

    expect(String(html`<ul>${nutinFor(['a', 'b'], li).nutinElse('none')}</ul>`)).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(renderedHtml(() => nutinFor(['a', 'b'], li).nutinElse('none'))).toBe('<li>a</li><li>b</li>');
  });

  it('nutinFor takes any iterable: Set, Map entries, a generator', () => {
    function* letters() {
      yield 'x';
      yield 'y';
    }

    expect(String(nutinFor(new Set(['a', 'b']), (item, index) => html`${index}${item}`))).toBe('0a1b');
    expect(String(nutinFor(new Map([['k', 1], ['l', 2]]), ([key, value]) => html`${key}=${value};`))).toBe('k=1;l=2;');
    expect(String(nutinFor(letters(), (item) => item))).toBe('xy');
  });

  it('a nutinFor item renders the same DOM as the same array written in an html hole', () => {
    const markup = '<button class="b" data-event="click:_remove">x</button>';
    const items = [
      markup,
      html`<b>${'<x>'}</b>`,
      raw(markup),
      trustedRaw(markup),
      nutinIf(true, '<i>'),
      nutinIf(false, 'no').nutinElse(raw('<u>u</u>')),
    ];
    const indexes = items.map((_item, index) => index);
    const item = (index) => items[index];

    const results = [
      renderedHtml(() => html`<div>${nutinFor(indexes, item)}</div>`),
      renderedHtml(() => html`<div>${nutinFor(indexes, item).nutinElse('none')}</div>`),
      renderedHtml(() => nutinFor(indexes, item)),
      renderedHtml(() => nutinFor(indexes, item).nutinElse('none')),
    ];

    expect(results).toEqual([
      renderedHtml(() => html`<div>${items}</div>`),
      renderedHtml(() => html`<div>${items}</div>`),
      renderedHtml(() => html`${items}`),
      renderedHtml(() => html`${items}`),
    ]);
  });

  it('a raw item loses its bindings and a trustedRaw item keeps them', () => {
    const markup = '<button class="b" data-event="click:_remove">x</button>';
    const clickFirst = (templateFn) => {
      const component = new TestComponent({ templateFn });
      component.render();
      component.getElement().querySelector('button.b').click();
      component.destroy();
      return component.removed;
    };

    expect(clickFirst(() => nutinFor([markup], (item) => raw(item)))).toBe(undefined);
    expect(clickFirst(() => html`<div>${nutinFor([markup], (item) => trustedRaw(item))}</div>`)).toBe(true);
  });

  it('nutinFor items in a textarea are text, and a javascript: URL in an item is blocked', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    let link;
    try {
      link = String(html`${nutinFor(['javascript:alert(1)', '/ok'], (url) => html`<a href="${url}">x</a>`)}`);
    } finally {
      warnSpy.restore();
    }

    expect(String(html`<textarea>${nutinFor(['<b>', raw('</textarea>')], (item) => item)}</textarea>`))
      .toBe('<textarea>&lt;b&gt;&lt;/textarea></textarea>');
    expect(link).toBe('<a href="about:invalid#nutin-blocked">x</a><a href="/ok">x</a>');
    expect(warnSpy.callCount).toBe(1);
  });

  it('nutinFor warns in development and renders empty for a value that is not iterable, a string included', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    let results;
    try {
      results = [{ a: 1 }, 5, 'ab'].map((items) => String(nutinFor(items, (item) => html`<li>${item}</li>`)));
    } finally {
      warnSpy.restore();
    }

    expect(results).toEqual(['', '', '']);
    expect(warnSpy.callCount).toBe(3);
    expect(warnSpy.calls[0][0]).toContain('got object');
  });

  it('nutinFor warns once in development when its render returns undefined', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    let result;
    try {
      result = String(nutinFor(['a', 'b'], () => undefined));
    } finally {
      warnSpy.restore();
    }

    expect(result).toBe('');
    expect(warnSpy.callCount).toBe(1);
    expect(warnSpy.calls[0][0]).toContain('forget a return');
  });

  it('data-event in nutinFor items binds to the parent component handler, with @dataset args', () => {
    const component = new PickComponent({
      config: { items: [{ id: 'a' }, { id: 'b' }] },
      templateFn: (cfg) => html`<ul>${nutinFor(cfg.items, (item) => html`
        <li><button data-event="click:_pick:@dataset:id" data-id="${item.id}">${item.id}</button></li>
      `)}</ul>`,
    });

    component.render();
    component.getElement().querySelectorAll('button').forEach((button) => button.click());

    expect(component.picked).toEqual(['a', 'b']);
  });

  it('nutinFor keeps the exact DOM shape of options and table rows, with no wrappers', () => {
    const countries = [{ code: 'fr', name: 'France' }, { code: 'it', name: 'Italy' }];

    expect(renderedHtml(() => html`<select>${nutinFor(countries, (c) => html`<option value="${c.code}">${c.name}</option>`)}</select>`))
      .toBe('<select><option value="fr">France</option><option value="it">Italy</option></select>');
    expect(renderedHtml(() => html`<table><tbody>${nutinFor(countries, (c) => html`<tr><td>${c.name}</td></tr>`)}</tbody></table>`))
      .toBe('<table><tbody><tr><td>France</td></tr><tr><td>Italy</td></tr></tbody></table>');
  });
});
