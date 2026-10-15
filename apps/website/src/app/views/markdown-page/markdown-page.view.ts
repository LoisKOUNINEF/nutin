import { html } from '../../../core/index.js';
import { MarkdownView } from '../../markdown/view/markdown.view.js';
import { DocsNavComponent } from '../../components/docs-nav/docs-nav.component.js';
import { loadA11yDrawer, loadA11yFloating } from '../../helpers/a11y-elements/load-a11y-elements.helper.js';
import { PrismHighlighter } from '../../helpers/prism/prism-highlighter.js';

// The site's layout around the Markdown feature's nav and content (see markdown-page.view.scss).
const withNav = html`
  <div class="markdown-view markdown-view__section">
    <aside data-component="markdown-nav"></aside>
    <div data-component="markdown-content"></div>
  </div>
`;

// Articles read as standalone pages: no nav, only the content and its table of contents.
const withoutNav = html`
  <div class="markdown-view markdown-view__section">
    <div data-component="markdown-content"></div>
  </div>
`;

// Every Markdown folder's view (markdownRoutes() "view" option in routes.ts): the docs nav
// with its mobile drawer, and Prism-highlighted code blocks.
export class MarkdownPageView extends MarkdownView {
  constructor(id: string) {
    super({
      id,
      template: id === 'articles' ? withoutNav : withNav,
      navComponent: DocsNavComponent,
      onContentRendered: (element) => PrismHighlighter.highlight(element),
    });
  }

  // The nav drawer's and its floating toggle's chunks are loaded here, client-side only (never during SSR).
  public override onEnter(): void {
    void loadA11yDrawer();
    void loadA11yFloating();
    super.onEnter();
  }
}
