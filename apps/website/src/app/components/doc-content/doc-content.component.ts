import { Component } from '../../../core/index.js';
import { IDocHeading, IDocPage } from '../../services/index.js';
import { navigateToDoc, PrismHighlighter } from '../../helpers/index.js';

export interface IDocContentConfig {
  page: IDocPage;
}

function renderToc(headings: IDocHeading[]): string {
  if (!headings.length) return '';

  const items = headings
    .map((heading) => `
      <li class="doc-toc__item doc-toc__item--depth-${heading.depth}">
        <a href="#${heading.id}">${heading.text}</a>
      </li>
    `)
    .join('');

  return `
    <nav class="doc-toc" aria-label="On this page">
      <span class="doc-toc__title">On this page</span>
      <ul>${items}</ul>
    </nav>
  `;
}

// Rendered from a build-time-compiled Markdown page (docs/), not user input — trusted.
const templateFn = (_config: IDocContentConfig) => `
  <article class="doc-content__body" data-highlight="prism">${_config.page.html}</article>
  ${renderToc(_config.page.headings)}
`;

export class DocContentComponent extends Component<HTMLElement, IDocContentConfig> {
  constructor(mountTarget: HTMLElement, config: IDocContentConfig) {
    super({ templateFn, mountTarget, config, trustLevel: 'trusted' });
  }

  protected override onAfterRender(): void {
    PrismHighlighter.apply();
  }

  private _navigateTo(slug: string): void {
    navigateToDoc(slug);
  }
}
