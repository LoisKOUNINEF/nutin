import { Component, Navigation, html, SafeHtml } from '../../../../core/index.js';
import { IMarkdownGroup, IMarkdownSection, MarkdownManifest } from '../../markdown-manifest.js';

export interface IMarkdownLandingConfig {
  title: string;
  description: string;
  // Listed with their pages, or as links to their own landing when sectionHref is set.
  sections: IMarkdownSection[];
  manifest: MarkdownManifest;
  pageHref: (slug: string) => string;
  sectionHref?: (sectionId: string) => string;
}

// The landing's building blocks, exported so a custom template can reuse them.
export function renderLandingPages(slugs: string[], config: IMarkdownLandingConfig): SafeHtml {
  const items = slugs.map((slug) => {
    const page = config.manifest.getPage(slug);
    if (!page) return '';
    return html`
      <li class="markdown-landing__page">
        <a href="${config.pageHref(slug)}" class="markdown-landing__link" data-event="click:_navigateTo:@attr:href">${page.title}</a>
        ${page.description ? html`<p class="markdown-landing__page-description">${page.description}</p>` : ''}
      </li>
    `;
  });
  return html`<ul class="markdown-landing__pages">${items}</ul>`;
}

export function renderLandingGroup(group: IMarkdownGroup, config: IMarkdownLandingConfig): SafeHtml {
  return html`
    <div class="markdown-landing__group">
      ${group.title ? html`<h3 class="markdown-landing__group-title">${group.title}</h3>` : ''}
      ${renderLandingPages(group.pages, config)}
    </div>
  `;
}

// withHeading: false for the only section of a landing, whose title is already the page's.
export function renderLandingSection(section: IMarkdownSection, config: IMarkdownLandingConfig, withHeading: boolean): SafeHtml {
  const body = section.groups
    ? section.groups.map((group) => renderLandingGroup(group, config))
    : renderLandingPages(section.pages ?? [], config);
  return html`
    <section class="markdown-landing__section">
      ${withHeading ? html`<h2 class="markdown-landing__section-title">${section.title}</h2>` : ''}
      ${withHeading && section.description ? html`<p class="markdown-landing__section-description">${section.description}</p>` : ''}
      ${body}
    </section>
  `;
}

export function renderLandingSectionLinks(config: IMarkdownLandingConfig): SafeHtml {
  const sectionHref = config.sectionHref ?? ((id: string) => id);
  return html`
    <ul class="markdown-landing__sections">
      ${config.sections.map((section) => html`
        <li class="markdown-landing__section">
          <a href="${sectionHref(section.id)}" class="markdown-landing__link" data-event="click:_navigateTo:@attr:href">${section.title}</a>
          ${section.description ? html`<p class="markdown-landing__section-description">${section.description}</p>` : ''}
        </li>
      `)}
    </ul>
  `;
}

export const markdownLandingTemplate = (_config: IMarkdownLandingConfig) => html`
  <div class="markdown-landing__body">
    <h1 class="markdown-landing__title">${_config.title}</h1>
    ${_config.description ? html`<p class="markdown-landing__description">${_config.description}</p>` : ''}
    ${_config.sectionHref
      ? renderLandingSectionLinks(_config)
      : _config.sections.map((section) => renderLandingSection(section, _config, _config.sections.length > 1))}
  </div>
`;

// The index shown on the bare route of a folder with "landing": its hub(s) and pages.
export class MarkdownLandingComponent extends Component<HTMLElement, IMarkdownLandingConfig> {
  // templateFn: your own template, e.g. built from the render helpers above.
  constructor(mountTarget: HTMLElement, config: IMarkdownLandingConfig, templateFn: (config: IMarkdownLandingConfig) => Template = markdownLandingTemplate) {
    // Mounting replaces the placeholder element, so its class is set here.
    super({ templateFn, mountTarget, config, props: { className: 'markdown-landing' } });
  }

  protected _navigateTo(href: string): void {
    Navigation.navigateTo(href);
  }
}
