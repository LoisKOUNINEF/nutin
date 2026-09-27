import { SnippetComponent } from '#root/dist/src/app/components/snippet/snippet.component.js';
import { PrismHighlighter } from '#root/dist/src/app/helpers/index.js';

function mount(config) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new SnippetComponent(target, { id: 0, sectionId: 0, content: 'npm run dev', type: 'bash', ...config });
  component.render();
  return component;
}

describe('SnippetComponent', () => {
  let applySpy;

  beforeAll(() => {
    setupJsdom();
  });

  beforeEach(() => {
    applySpy = spyOn(PrismHighlighter, 'apply').andCallFake(() => {});
  });

  afterEach(() => {
    applySpy.restore();
    document.body.innerHTML = '';
  });

  it('renders the code in a <section> with its language class, then highlights it', () => {
    const component = mount();
    const code = component.element.querySelector('pre code');
    expect(component.element.tagName).toBe('SECTION');
    expect(code.textContent).toBe('npm run dev');
    expect(code.classList.contains('language-bash')).toBe(true);
    expect(applySpy.callCount).toBe(1);
    component.destroy();
  });

  it('drops the optional title and captions when not provided', () => {
    const component = mount();
    expect(component.element.querySelector('h3')).toBe(null);
    expect(component.element.querySelectorAll('p').length).toBe(0);
    component.destroy();
  });

  it('renders the optional title and captions when provided', () => {
    const component = mount({ title: 'Dev server', before: 'First:', after: 'Then open it.' });
    expect(component.element.querySelector('h3').textContent).toContain('Dev server');
    expect([...component.element.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['First:', 'Then open it.']);
    component.destroy();
  });
});
