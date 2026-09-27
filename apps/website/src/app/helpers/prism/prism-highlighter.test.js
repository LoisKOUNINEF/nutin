import { PrismHighlighter } from '#root/dist/src/app/helpers/prism/prism-highlighter.js';

describe('PrismHighlighter', () => {
  beforeAll(() => {
    setupJsdom();
  });

  afterEach(() => {
    delete window.Prism;
    document.body.innerHTML = '';
  });

  it('apply warns and does nothing when Prism is not loaded', () => {
    const warnSpy = spyOn(console, 'warn').andCallFake(() => {});
    try {
      PrismHighlighter.apply();
    } finally {
      warnSpy.restore();
    }
    expect(warnSpy.callCount).toBe(1);
  });

  it('apply highlights every [data-highlight="prism"] target', () => {
    const highlighted = [];
    window.Prism = { highlightAllUnder: (el) => highlighted.push(el) };
    document.body.innerHTML = '<pre data-highlight="prism"></pre><pre></pre><article data-highlight="prism"></article>';

    PrismHighlighter.apply();
    expect(highlighted.map((el) => el.tagName)).toEqual(['PRE', 'ARTICLE']);
  });

  it('apply is scoped to the given root', () => {
    const highlighted = [];
    window.Prism = { highlightAllUnder: (el) => highlighted.push(el) };
    document.body.innerHTML = '<pre data-highlight="prism"></pre><div id="root"><pre data-highlight="prism" id="inside"></pre></div>';

    PrismHighlighter.apply(document.getElementById('root'));
    expect(highlighted.map((el) => el.id)).toEqual(['inside']);
  });
});
