import { MarkdownContentComponent } from '#root/dist/src/app/markdown/components/markdown-content/markdown-content.component.js';

function mount(config) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new MarkdownContentComponent(target, config);
  component.render();
  return component;
}

describe('MarkdownContentComponent', () => {
  it('shows the empty state when the folder has no page to show', () => {
    const component = mount({});
    expect(component.element.querySelector('.markdown-content__empty')).toBeTruthy();
    expect(component.element.querySelector('.markdown-content__error')).toBe(null);
    component.destroy();
  });

  it('shows an error, not the empty state, when the manifest failed to load', () => {
    const component = mount({ loadFailed: true });
    const error = component.element.querySelector('.markdown-content__error');
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent.trim()).not.toBe('');
    expect(component.element.querySelector('.markdown-content__empty')).toBe(null);
    component.destroy();
  });

  it('renders the page with its table of contents', () => {
    const component = mount({
      page: {
        slug: 'a', title: 'A', description: '', section: 'index', group: null, order: 0, source: 'a.md',
        html: '<h1 id="a">A</h1><h2 id="one">One</h2><h2 id="two">Two</h2>',
        headings: [{ depth: 2, text: 'One', id: 'one' }, { depth: 2, text: 'Two', id: 'two' }],
      },
    });
    expect(component.element.querySelector('.markdown-content__body h2#one')).toBeTruthy();
    expect([...component.element.querySelectorAll('.markdown-toc a')].map((a) => a.getAttribute('href'))).toEqual(['#one', '#two']);
    component.destroy();
  });
});
