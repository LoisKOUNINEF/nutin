import { Component } from '../../../core/index.js';
import { IResourceHeading, IResourcePage } from '../../services/index.js';
import { navigateToDoc, PrismHighlighter } from '../../helpers/index.js';

export interface IResourceContentConfig {
  page?: IResourcePage;
  routePrefix: string;
}

function renderToc(headings: IResourceHeading[]): string {
  // A single heading (e.g. a changelog entry's own version number, "## 1.0.1")
  // is redundant next to a page already titled that — only worth a TOC at 2+.
  if (headings.length <= 1) return '';

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

// Rendered from build-time-compiled Markdown (resources/), not user input — trusted.
const templateFn = (_config: IResourceContentConfig) => {
  if (!_config.page) {
    return `<p class="doc-content__empty" data-i18n="${_config.routePrefix}.empty"></p>`;
  }

  return `
    <article class="doc-content__body" data-highlight="prism">${_config.page.html}</article>
    ${renderToc(_config.page.headings)}
  `;
};

export class ResourceContentComponent extends Component<HTMLElement, IResourceContentConfig> {
  constructor(mountTarget: HTMLElement, config: IResourceContentConfig) {
    // Mounting replaces the `doc-content` placeholder outright, so its class
    // must be re-applied here or the body/TOC flex-row layout CSS never matches.
    super({ templateFn, mountTarget, config, trustLevel: 'trusted', props: { className: 'doc-content' } });
  }

  protected override onAfterRender(): void {
    if (this.config.page) PrismHighlighter.apply();
  }

  private _navigateTo(href: string): void {
    navigateToDoc(href);
  }
}
