import { Component } from '../../../core/index.js';
import { DocsManifestService, IDocGroup, IDocSection } from '../../services/index.js';
import { navigateToDoc } from '../../helpers/index.js';

export interface IDocsNavConfig {
  sections: IDocSection[];
  currentSlug: string;
}

function renderPageLink(slug: string, currentSlug: string): string {
  const page = DocsManifestService.getPage(slug);
  if (!page) return '';

  const activeClass = slug === currentSlug ? ' docs-nav__link--active' : '';
  return `
    <li>
      <a
        href="/docs/${slug}"
        class="docs-nav__link${activeClass}"
        data-slug="${slug}"
        data-event="click:_navigateTo:@dataset:slug"
      >${page.title}</a>
    </li>
  `;
}

function renderGroup(group: IDocGroup, currentSlug: string): string {
  return `
    <li class="docs-nav__group">
      <span class="docs-nav__group-title">${group.title}</span>
      <ul class="docs-nav__pages">${group.pages.map((slug) => renderPageLink(slug, currentSlug)).join('')}</ul>
    </li>
  `;
}

function renderSection(section: IDocSection, currentSlug: string): string {
  const items = section.groups
    ? section.groups.map((group) => renderGroup(group, currentSlug)).join('')
    : (section.pages ?? []).map((slug) => renderPageLink(slug, currentSlug)).join('');

  return `
    <li class="docs-nav__section">
      <span class="docs-nav__section-title">${section.title}</span>
      <ul class="docs-nav__groups">${items}</ul>
    </li>
  `;
}

const templateFn = (_config: IDocsNavConfig) => `
  <nav class="docs-nav" aria-label="Documentation">
    <ul class="docs-nav__sections">
      ${_config.sections.map((section) => renderSection(section, _config.currentSlug)).join('')}
    </ul>
  </nav>
`;

export class DocsNavComponent extends Component<HTMLElement, IDocsNavConfig> {
  constructor(mountTarget: HTMLElement, config: IDocsNavConfig) {
    super({ templateFn, mountTarget, config });
  }

  private _navigateTo(slug: string): void {
    navigateToDoc(slug);
  }
}
