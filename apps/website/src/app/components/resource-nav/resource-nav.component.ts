import { Component } from '../../../core/index.js';
import { ResourceManifest, IResourceGroup, IResourceSection } from '../../services/index.js';
import { navigateToDoc } from '../../helpers/index.js';

export interface IResourceNavConfig {
  sections: IResourceSection[];
  manifest: ResourceManifest<any>;
  routePrefix: string;
  currentSlug: string;
}

function renderPageLink(slug: string, config: IResourceNavConfig): string {
  const page = config.manifest.getPage(slug);
  if (!page) return '';

  const activeClass = slug === config.currentSlug ? ' docs-nav__link--active' : '';
  return `
    <li>
      <a
        href="/${config.routePrefix}/${slug}"
        class="docs-nav__link${activeClass}"
        data-event="click:_navigateTo:@attr:href"
      >${page.title}</a>
    </li>
  `;
}

function renderGroup(group: IResourceGroup, config: IResourceNavConfig): string {
  return `
    <li class="docs-nav__group">
      <span class="docs-nav__group-title">${group.title}</span>
      <ul class="docs-nav__pages">${group.pages.map((slug) => renderPageLink(slug, config)).join('')}</ul>
    </li>
  `;
}

function renderSection(section: IResourceSection, config: IResourceNavConfig): string {
  const items = section.groups
    ? section.groups.map((group) => renderGroup(group, config)).join('')
    : (section.pages ?? []).map((slug) => renderPageLink(slug, config)).join('');

  return `
    <li class="docs-nav__section">
      <span class="docs-nav__section-title">${section.title}</span>
      <ul class="docs-nav__groups">${items}</ul>
    </li>
  `;
}

const templateFn = (_config: IResourceNavConfig) => `
  <nav class="docs-nav" aria-label="Documentation">
    <ul class="docs-nav__sections">
      ${_config.sections.map((section) => renderSection(section, _config)).join('')}
    </ul>
  </nav>
`;

export class ResourceNavComponent extends Component<HTMLElement, IResourceNavConfig> {
  constructor(mountTarget: HTMLElement, config: IResourceNavConfig) {
    // Mounting replaces the `docs-nav__container` placeholder outright, so its
    // class must be re-applied here or the sidebar width/spacing CSS never matches.
    super({ templateFn, mountTarget, config, props: { className: 'docs-nav__container' } });
  }

  private _navigateTo(href: string): void {
    navigateToDoc(href);
  }
}
