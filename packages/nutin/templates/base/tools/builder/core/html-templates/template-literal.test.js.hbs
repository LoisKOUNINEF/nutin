import { scanTemplate, minifyTemplateBody, findHtmlTemplates, minifyTemplatesIn } from './template-literal.js';

// Scans `source` from just past its first backtick and returns the literal's body.
function bodyOf(source) {
  const open = source.indexOf('`') + 1;
  const scan = scanTemplate(source, open);
  return scan && source.slice(open, scan.end);
}

describe('template-literal', () => {
  it('scanTemplate finds the closing backtick past a nested html`` in a .map()', () => {
    const source = 'const t = html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`; after();';
    expect(bodyOf(source)).toBe('<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>');
  });

  it('scanTemplate is not fooled by backticks or braces in strings, comments and regex literals', () => {
    const body = "<p>${s.replace(/`/g, '')}${'}`'}${x /* ` } */}${\"{\"}${y // `}\n}</p>";
    expect(bodyOf('html`' + body + '`; x;')).toBe(body);
  });

  it('scanTemplate reads a "/" after a value as a division, not a regex', () => {
    const body = '<p>${total / count} of ${(a) / 2} / ${b[0] / 3}</p>';
    expect(bodyOf('html`' + body + '`; x;')).toBe(body);
  });

  it('scanTemplate skips escaped backticks and escaped ${', () => {
    const body = '<p>\\` and \\${not} and ${real}</p>';
    const scan = scanTemplate('html`' + body + '`', 5);
    expect(scan.end).toBe(5 + body.length);
    expect(scan.expressions.length).toBe(1);
  });

  it('scanTemplate returns null for an unclosed literal or expression', () => {
    expect(scanTemplate('html`<p>${a</p>', 5)).toBe(null);
    expect(scanTemplate('html`<p>', 5)).toBe(null);
  });

  it('minifyTemplateBody minifies the markup and the nested html`` bodies', async () => {
    const body = '\n<ul class="list">\n  ${items.map((i) => html`\n    <li>\n      ${i}\n    </li>\n  `)}\n</ul>\n<p>\n  after   nested\n</p>\n';
    expect(await minifyTemplateBody(body)).toBe('<ul class="list">${items.map((i) => html`<li>${i}</li>`)}</ul><p>after nested</p>');
  });

  it('minifyTemplateBody puts every expression back exactly as written', async () => {
    const body = '<p title="${t}">  ${\'a   b\'}  ${a < b ? x : y}  </p>';
    expect(await minifyTemplateBody(body)).toBe('<p title="${t}">${\'a   b\'} ${a < b ? x : y}</p>');
  });

  it('minifyTemplateBody keeps expressions in attribute-name position', async () => {
    expect(await minifyTemplateBody('<input ${attrs}  ${more}>  <b>  x  </b>')).toBe('<input ${attrs} ${more}> <b>x</b>');
  });

  it('minifyTemplateBody leaves a template with a dynamic tag name as written', async () => {
    expect(await minifyTemplateBody('<${tag}>  x  </${tag}>')).toBe(null);
  });

  it('minifyTemplateBody leaves a template as written when the minifier would drop an expression', async () => {
    expect(await minifyTemplateBody('<div style="${css}">x</div>')).toBe(null);
  });

  it('minifyTemplateBody leaves a template as written when the scanner cannot follow it', async () => {
    expect(await minifyTemplateBody('<p>${a</p>')).toBe(null);
    expect(await minifyTemplateBody('<p>__nutin_expr_0__ ${a}</p>')).toBe(null);
  });

  it('minifyTemplateBody keeps a nested html`` it cannot minify as written', async () => {
    const body = '<ul>  ${items.map((i) => html`<li style="${i}">x</li>`)}  </ul>';
    expect(await minifyTemplateBody(body)).toBe('<ul>${items.map((i) => html`<li style="${i}">x</li>`)}</ul>');
  });

  it('findHtmlTemplates lists every top-level html`` literal, each holding its nested ones', () => {
    const source = [
      'const tip = `not ${html`<i>a</i>`} html`;',
      '// html`<b>comment</b>`',
      'class X extends Component {',
      '  override generateTemplate() {',
      "    if (this.a) return html`<p>${'}'}</p>`;",
      '    return html`<ul>${this.items.map((i) => html`<li>${i}</li>`)}</ul>`;',
      '  }',
      '}',
    ].join('\n');
    const templates = findHtmlTemplates(source);
    expect(templates.map((t) => t.body)).toEqual([
      "<p>${'}'}</p>",
      '<ul>${this.items.map((i) => html`<li>${i}</li>`)}</ul>',
    ]);
    expect(source.slice(templates[1].open, templates[1].end)).toBe(templates[1].body);
    expect(templates[0].tagged).toBe(true);
  });

  it('findHtmlTemplates returns null when the scanner cannot follow the file', () => {
    expect(findHtmlTemplates('const a = html`<p>${b</p>`;')).toBe(null);
    expect(findHtmlTemplates('function f() { return html`<p></p>`;')).toBe(null);
    expect(findHtmlTemplates('const a = 1;')).toEqual([]);
  });

  it('minifyTemplatesIn minifies every template, keeps one it cannot as written, and skips overlaps', async () => {
    const source = 'a(html`<p>  x  </p>`); b(html`<p>${a</p>`); c(html`<div>\n  <b>y</b>\n</div>`);';
    const open = (needle) => source.indexOf(needle) + needle.length;
    const span = (start, body) => ({ open: start, end: start + body.length, body });
    const first = span(open('a(html`'), '<p>  x  </p>');
    const broken = span(open('b(html`'), '<p>${a</p>');
    const last = span(open('c(html`'), '<div>\n  <b>y</b>\n</div>');
    const overlap = span(first.open + 1, 'p>  x');

    const result = await minifyTemplatesIn(source, [last, overlap, broken, first]);
    expect(result.content).toBe('a(html`<p>x</p>`); b(html`<p>${a</p>`); c(html`<div><b>y</b></div>`);');
    expect(result.unminified).toBe(true);

    const clean = await minifyTemplatesIn(source, [first]);
    expect(clean.unminified).toBe(false);
  });
});
