import { applySubstitutions, upsertInHead } from './html-substitutions.js';

const TEMPLATE = '<html lang="en"><head><title>x</title><meta name="description" content="d"></head><body></body></html>';

describe('applySubstitutions', () => {
  it('applySubstitutions sets title, description, canonical and og tags', () => {
    const html = applySubstitutions(TEMPLATE, 'fr', 'Home', 'Welcome', 'https://site.test/fr', '/og.png');
    expect(html).toContain('<html lang="fr">');
    expect(html).toContain('<title>Home</title>');
    expect(html).toContain('<meta name="description" content="Welcome">');
    expect(html).toContain('<link rel="canonical" href="https://site.test/fr/" />');
    expect(html).toContain('<meta property="og:image" content="/og.png" />');
  });

  it('applySubstitutions keeps $ replacement patterns in values literal', () => {
    const title = "Only $' left, $` and $& and $1";
    const html = applySubstitutions(TEMPLATE, 'en', title, 'Save $$ now', 'https://site.test', '');
    expect(html).toContain("<title>Only $&#39; left, $` and $&amp; and $1</title>");
    expect(html).toContain('<meta name="description" content="Save $$ now">');
    expect(html).toContain('<meta property="og:title" content="Only $&#39; left, $` and $&amp; and $1" />');
    expect(html.match(/<html/g).length).toBe(1);
  });

  it('applySubstitutions escapes markup in title, description and URLs', () => {
    const html = applySubstitutions(TEMPLATE, 'en', '<b>"T"</b>', 'a & b', 'https://site.test/?a=1&b=2', '', [
      { hreflang: 'en', href: 'https://site.test/en?x="y"' },
    ]);
    expect(html).toContain('<title>&lt;b&gt;&quot;T&quot;&lt;/b&gt;</title>');
    expect(html).toContain('content="a &amp; b"');
    expect(html).toContain('href="https://site.test/?a=1&amp;b=2/"');
    expect(html).toContain('href="https://site.test/en?x=&quot;y&quot;"');
  });

  it('applySubstitutions inserts missing tags before </head>', () => {
    const html = applySubstitutions('<html><head></head><body></body></html>', 'en', 'T $&', 'D', 'https://site.test', '');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>T $&amp;</title>');
    expect(html).toContain('<meta name="description" content="D" />');
  });

  it('upsertInHead passes capture groups to the replacement function', () => {
    const html = upsertInHead('<head><title>a</title></head>', /(<title>)[^<]*(<\/title>)/, (start, end) => `${start}$'${end}`, '');
    expect(html).toBe("<head><title>$'</title></head>");
  });
});
