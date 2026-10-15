import * as SecurityHelper from '#root/dist/src/core/base-classes/base-component/helpers/security.helper.js';

describe('SecurityHelper', () => {
  it('sanitizeTemplate returns an empty string for null and undefined', () => {
    expect(SecurityHelper.sanitizeTemplate(null)).toBe('');
    expect(SecurityHelper.sanitizeTemplate(undefined)).toBe('');
  });

  it('sanitizeTemplate stringifies non-string values before sanitizing', () => {
    expect(SecurityHelper.sanitizeTemplate(42)).toBe('42');
    expect(SecurityHelper.sanitizeTemplate(true)).toBe('true');
  });

  it('sanitizeTemplate defaults to the "normal" trust level', () => {
    const result = SecurityHelper.sanitizeTemplate('<div><script>alert(1)</script></div>');
    expect(result).toBe('<div></div>');
  });

  it('sanitizeTemplate "trusted" level leaves the template completely unchanged', () => {
    const template = '<script>alert(1)</script><div onclick="x()">hi</div>';
    expect(SecurityHelper.sanitizeTemplate(template, 'trusted')).toBe(template);
  });

  it('sanitizeTemplate "normal" level strips <script> tags', () => {
    const result = SecurityHelper.sanitizeTemplate('<p>hi</p><script>alert(1)</script>', 'normal');
    expect(result).toBe('<p>hi</p>');
  });

  it('sanitizeTemplate "normal" level strips inline on* event handlers', () => {
    const result = SecurityHelper.sanitizeTemplate('<button onclick="doBad()">Click</button>', 'normal');
    expect(result).toContain('<button');
    expect(result.includes('onclick')).toBe(false);
  });

  it('sanitizeTemplate "normal" level keeps iframes (only "strict" removes them)', () => {
    const result = SecurityHelper.sanitizeTemplate('<iframe src="https://example.com"></iframe>', 'normal');
    expect(result).toContain('<iframe');
  });

  it('sanitizeTemplate "strict" level also strips iframe, object and embed tags', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<iframe src="x"></iframe><object data="x"></object><embed src="x">',
      'strict'
    );
    expect(result.includes('<iframe')).toBe(false);
    expect(result.includes('<object')).toBe(false);
    expect(result.includes('<embed')).toBe(false);
  });

  it('sanitizeTemplate "strict" level strips javascript: hrefs and data: srcs', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<a href="javascript:alert(1)">link</a><img src="data:text/html,evil">',
      'strict'
    );
    expect(result.includes('javascript:')).toBe(false);
    expect(result.includes('src="data:')).toBe(false);
  });

  it('sanitizeTemplate "strict" level still strips scripts and inline handlers like normal', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<script>bad()</script><div onmouseover="bad()">hi</div>',
      'strict'
    );
    expect(result.includes('<script>')).toBe(false);
    expect(result.includes('onmouseover')).toBe(false);
  });

  it('sanitizeTemplate "normal" level strips unquoted event handler attributes', () => {
    const result = SecurityHelper.sanitizeTemplate('<img src=x onerror=alert(1)>', 'normal');
    expect(result.includes('onerror')).toBe(false);
  });

  it('sanitizeTemplate "normal" level is not fooled by nested-tag script reassembly', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<scr<script></script>ipt>alert(document.domain)</scr<script></script>ipt>',
      'normal'
    );
    // A naive substring check is misleading here: the sanitized output can still
    // contain the literal text "<script>" as part of an inert malformed tag name
    // (e.g. "SCR<SCRIPT"), which HTML parsers never re-interpret as a real <script>
    // element. Re-parse the result and assert no live <script> element exists.
    const reparsed = document.createElement('template');
    reparsed.innerHTML = result;
    expect(reparsed.content.querySelector('script')).toBe(null);
  });

  it('sanitizeTemplate "normal" level is not fooled by nested-tag event handler reassembly', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<img src=x onerr<script>x</script>or=alert(1)>',
      'normal'
    );
    expect(result.includes('onerror')).toBe(false);
  });

  it('sanitizeTemplate "strict" level strips whitespace-obfuscated javascript: URLs', () => {
    const result = SecurityHelper.sanitizeTemplate('<a href="java\tscript:alert(1)">x</a>', 'strict');
    expect(result.includes('javascript:')).toBe(false);
  });

  it('sanitizeTemplate "strict" level strips javascript: from action/formaction/poster/background too', () => {
    const result = SecurityHelper.sanitizeTemplate('<form action="javascript:alert(1)">x</form>', 'strict');
    expect(result.includes('javascript:')).toBe(false);
  });

  it('sanitizeTemplate "normal" level strips javascript: hrefs, including whitespace-obfuscated ones', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<a href="javascript:alert(1)">a</a><a href=" java\tscript:alert(1)">b</a>',
      'normal'
    );
    expect(result).toBe('<a>a</a><a>b</a>');
  });

  it('sanitizeTemplate "normal" level strips javascript: from form action and formaction', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<form action="javascript:alert(1)"><button formaction="javascript:alert(1)">x</button></form>',
      'normal'
    );
    expect(result.includes('javascript:')).toBe(false);
  });

  it('sanitizeTemplate "normal" level strips javascript: from svg xlink:href', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',
      'normal'
    );
    expect(result.includes('javascript:')).toBe(false);
  });

  it('sanitizeTemplate "normal" level keeps safe and data: URLs', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<a href="https://example.com">a</a><img src="data:image/png;base64,AAAA">',
      'normal'
    );
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('src="data:image/png;base64,AAAA"');
  });

  it('sanitizeTemplate "normal" and "strict" levels strip srcdoc, even when its markup is escaped', () => {
    const template = '<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>';
    expect(SecurityHelper.sanitizeTemplate(template, 'normal')).toBe('<iframe></iframe>');
    expect(SecurityHelper.sanitizeTemplate(template, 'strict')).toBe('');
  });

  it('sanitizeTemplate "trusted" level keeps javascript: URLs and srcdoc', () => {
    const template = '<a href="javascript:void(0)">a</a><iframe srcdoc="x"></iframe>';
    expect(SecurityHelper.sanitizeTemplate(template, 'trusted')).toBe(template);
  });

  it('sanitizeTemplate "normal" level strips svg <set>/<animate> that rewrite href', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<svg><a>' +
        '<set attributeName="href" to="javascript:alert(1)"/>' +
        '<animate attributeName=" HREF " values="javascript:alert(1)"/>' +
        '<animate attributeName="xlink:href" from="javascript:alert(1)" to="x"/>' +
        '<text>x</text></a></svg>',
      'normal'
    );
    expect(result.includes('javascript:')).toBe(false);
    expect(result).toContain('<text>x</text>');
  });

  it('sanitizeTemplate "normal" level keeps svg animations of non-URL attributes', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<svg><circle r="5"><animate attributeName="opacity" values="0;1" dur="1s"></animate></circle></svg>',
      'normal'
    );
    expect(result).toContain('attributeName="opacity"');
  });

  it('sanitizeTemplate "normal" level keeps an svg <set> without attributeName', () => {
    const result = SecurityHelper.sanitizeTemplate('<svg><set to="1"></set></svg>', 'normal');
    expect(result).toContain('<set to="1">');
  });

  it('stripBindings removes Nutin binding attributes and keeps the rest', () => {
    const result = SecurityHelper.stripBindings(
      '<button class="b" data-event="click:_remove" data-component="x" data-catalog="y" data-bind="z" ' +
        'data-i18n="k" data-pipe="upper" data-pipe-source="s" data-id="7">x</button>'
    );
    expect(result).toBe('<button class="b" data-id="7">x</button>');
  });

  it('stripBindingsFrom strips an element in place, keeping class, style, other data-* and text', () => {
    const root = document.createElement('section');
    root.innerHTML = '<a href="/x" class="link" style="color: red" data-event="click:_go" data-i18n="nav.x" data-card-description>X</a>'
      + '<div data-component="child" data-catalog="items" data-bind="name" data-pipe="upper" data-pipe-source="v"></div>'
      + '<pre><code>&lt;div data-component="hello"&gt;&lt;/div&gt;</code></pre>'
      + '<template><i data-event="click:_x">i</i></template>';

    SecurityHelper.stripBindingsFrom(root);

    const link = root.querySelector('a');
    expect(link.getAttribute('class')).toBe('link');
    expect(link.getAttribute('style')).toBe('color: red');
    expect(link.hasAttribute('data-card-description')).toBe(true);
    expect(link.hasAttribute('data-event') || link.hasAttribute('data-i18n')).toBe(false);
    expect(root.querySelector('div').attributes.length).toBe(0);
    expect(root.querySelector('code').textContent).toBe('<div data-component="hello"></div>');
    expect(root.querySelector('template').innerHTML).toBe('<i>i</i>');
  });

  it('stripBindings also strips nested <template> content', () => {
    const result = SecurityHelper.stripBindings('<template><i data-event="click:_x">i</i></template>');
    expect(result).toBe('<template><i>i</i></template>');
  });

  it('sanitizeToFragment returns sanitized nodes without re-serializing them', () => {
    const fragment = SecurityHelper.sanitizeToFragment('<p onclick="x()">a</p><script>x()</script>', 'normal');
    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.firstChild.outerHTML).toBe('<p>a</p>');
  });

  it('sanitizeToFragment keeps everything at "trusted" and handles null', () => {
    const fragment = SecurityHelper.sanitizeToFragment('<p onclick="x()">a</p>', 'trusted');
    expect(fragment.firstChild.getAttribute('onclick')).toBe('x()');
    expect(SecurityHelper.sanitizeToFragment(null).childNodes.length).toBe(0);
  });

  it('sanitizeTemplate "normal" level strips style, link, base and meta elements', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<style>p{}</style><link rel="stylesheet" href="/x.css"><base href="/x/"><meta http-equiv="refresh" content="0"><p>ok</p>',
      'normal'
    );
    expect(result).toBe('<p>ok</p>');
  });

  it('sanitizeTemplate "normal" level strips script and style inside svg', () => {
    const result = SecurityHelper.sanitizeTemplate('<svg><script>x()</script><style>a{}</style><circle r="1"></circle></svg>', 'normal');
    expect(result).toBe('<svg><circle r="1"></circle></svg>');
  });

  it('sanitizeTemplate "normal" level strips data: and javascript: documents from frames but keeps https ones', () => {
    const result = SecurityHelper.sanitizeTemplate(
      '<iframe src="data:text/html,x"></iframe><object data="data:text/html,x"></object>' +
        '<embed src="javascript:x()"><iframe src="https://example.com"></iframe>',
      'normal'
    );
    expect(result).toBe('<iframe></iframe><object></object><embed><iframe src="https://example.com"></iframe>');
  });

  it('sanitizeTemplate and stripBindings do not throw on a <template> inside svg', () => {
    const markup = '<svg><template><text data-event="click:_x" onclick="x()">t</text></template></svg>';
    expect(SecurityHelper.sanitizeTemplate(markup, 'normal')).toBe('<svg><template><text data-event="click:_x">t</text></template></svg>');
    expect(SecurityHelper.stripBindings(markup)).toBe('<svg><template><text onclick="x()">t</text></template></svg>');
  });

  it('escapeHtml escapes all special characters', () => {
    expect(SecurityHelper.escapeHtml(`<div class="a" data='b'>&</div>`))
      .toBe('&lt;div class=&quot;a&quot; data=&#039;b&#039;&gt;&amp;&lt;/div&gt;');
  });

  it('escapeHtml returns an empty string for null and undefined', () => {
    expect(SecurityHelper.escapeHtml(null)).toBe('');
    expect(SecurityHelper.escapeHtml(undefined)).toBe('');
  });

  it('escapeHtml stringifies non-string values before escaping', () => {
    expect(SecurityHelper.escapeHtml(123)).toBe('123');
  });
});
