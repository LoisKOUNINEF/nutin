import { Component, Navigation, html, trustedRaw, SafeHtml } from '../../../../core/index.js';
import { IMarkdownHeading, IMarkdownPage } from '../../markdown-manifest.js';
import { markdownText } from '../../markdown-i18n.js';

export interface IMarkdownContentConfig {
  page?: IMarkdownPage;
  // The folder's manifest failed to load: shown as an error, not as an empty folder.
  loadFailed?: boolean;
  // Called after each render that shows a page (MarkdownView's "onContentRendered" option).
  onRendered?: (element: HTMLElement, page: IMarkdownPage) => void;
}

// Exported so a custom template can reuse it.
export function renderToc(headings: IMarkdownHeading[]): SafeHtml | string {
  // A single heading adds nothing next to the page title — only worth a TOC at 2+.
  if (headings.length <= 1) return '';

  const items = headings
    .map((heading) => html`
      <li class="markdown-toc__item markdown-toc__item--depth-${heading.depth}">
        <a href="#${heading.id}">${heading.text}</a>
      </li>
    `);

  return html`
    <nav class="markdown-toc" aria-label="${markdownText('onThisPage', 'On this page')}">
      <span class="markdown-toc__title">${markdownText('onThisPage', 'On this page')}</span>
      <ul>${items}</ul>
    </nav>
  `;
}

// page.html is compiled at build time from the project's own Markdown files (not user
// input), hence trustLevel 'trusted'. With generateSEOFiles, every page is also prerendered
// (tools/builder/core/markdown/markdown-seo-routes.js).
export const markdownContentTemplate = (_config: IMarkdownContentConfig) => {
  if (!_config.page) {
    return _config.loadFailed
      ? html`<p class="markdown-content__error" role="alert">${markdownText('loadError', "This page couldn't be loaded.")}</p>`
      : html`<p class="markdown-content__empty">${markdownText('empty', 'Nothing here yet.')}</p>`;
  }

  return html`
    <article class="markdown-content__body">${trustedRaw(_config.page.html)}</article>
    ${renderToc(_config.page.headings)}
  `;
};

export class MarkdownContentComponent extends Component<HTMLElement, IMarkdownContentConfig> {
  // templateFn: your own template, e.g. built from renderToc() and the page's html.
  constructor(mountTarget: HTMLElement, config: IMarkdownContentConfig, templateFn: (config: IMarkdownContentConfig) => Template = markdownContentTemplate) {
    // Mounting replaces the placeholder element, so its class is re-applied here.
    super({ templateFn, mountTarget, config, trustLevel: 'trusted', props: { className: 'markdown-content' } });
  }

  protected override onAfterRender(): void {
    if (this.config.page) this.config.onRendered?.(this.element, this.config.page);
    super.onAfterRender();
  }

  // Internal links between pages carry data-event="click:_navigateTo:@attr:href".
  protected _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }
}
