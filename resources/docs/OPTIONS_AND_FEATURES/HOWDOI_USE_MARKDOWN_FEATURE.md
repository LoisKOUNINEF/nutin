# How do I use the Markdown feature?

## What is the Markdown feature?

Write pages in Markdown and serve them in your app, e.g. documentation, a blog or a changelog.

At build time, each configured folder is compiled into one JSON manifest (`/generated/<name>.json`) containing every page's HTML, title, description and headings.
At runtime, a manifest service loads it and a view renders the pages with a navigation and an "On this page" table of contents.

Nothing is parsed in the browser: the Markdown is compiled once, with [marked](https://marked.js.org/) (GitHub-flavored Markdown).

## Add Markdown to your app

```bash
nutin-add markdown
```

This adds:
- `markdownSources` to `nutin.config.js`, pointing at a sample `markdown-content/` folder
- the compiler, in `tools/builder/core/markdown/`
- a `markdown:check` script
- the runtime, in `src/app/markdown/`: `MarkdownManifestsService`, `MarkdownView`, `MarkdownGuards`, `markdownRoutes()` and the navigation / content components
- `...markdownRoutes()` to your `appRoutes` in `routes.ts`, and the Markdown build step to `tools/builder/builder.js` and `tools/dev/watcher.js`

These three files are patched: your own changes to them, such as routes you added, are kept. If the lines the patch attaches to are gone, the file is left untouched and the patch is printed for you to apply.

The compiler's dependencies (`marked`, `gray-matter`) are installed on your first build, as dev dependencies. You are asked first - pass `-y` to accept without a prompt:

```bash
<pm> run build -- -y
```

In a non-interactive shell (CI, ...), the build stops instead of installing them, unless `-y` is passed. A production build never installs them: install them beforehand.

Or you can install them manually as devDependencies

```bash
{ name: 'marked', version: '^18.0.14' },
{ name: 'gray-matter', version: '^4.0.3' }
```

`/markdown-content` now shows the sample folder's first page, and `/markdown-content/<slug>` each page.

## Configure folders

Folders are listed in `nutin.config.js`'s `markdownSources.sourceFolders`, as a path or as an object:

```js
export default {
  // ...
  markdownSources: {
    sourceFolders: [
      'markdown-content',
      {
        folder: 'docs',
        hubFiles: ['API.md', 'GUIDES.md'],
        routePrefix: 'docs',
        sectionInPath: true,
        prefixReplacements: [['HOWDOI_', '']],
      },
    ],
  },
}
```

| Option | Default | Description |
| --- | --- | --- |
| `folder` | - | Folder path, relative to the project root |
| `routePrefix` | folder name | Route prefix of the page links, and manifest name (`/generated/<routePrefix>.json`) |
| `hubFiles` | `<FOLDER_NAME>.md` if it exists | Table of contents files, see [Hub files](#hub-files) |
| `sectionInPath` | `false` | Include each hub's section in the page links: `/docs/<section>/<slug>` |
| `prefixReplacements` | `[]` | `[prefix, replacement]` pairs applied to file names to build slugs, e.g. `HOWDOI_CREATE_A_VIEW.md` -> `create-a-view` |
| `seo` | `true` | With `generateSEOFiles`, prerender every page and list it in `sitemap.xml`. Set `false` to keep this folder's pages client-side only |
| `ogImage` | - | Default `og:image` of the folder's SEO pages. A page's frontmatter `ogImage` takes precedence |
| `landing` | `false` | Show an index of the folder on its bare route instead of its first page: `true`, or `{ title, description }`. See [Landing pages](#landing-pages) |

Adding a folder is all it takes: `markdownRoutes()` creates its route (`/<routePrefix>/:slug?`, or `/<routePrefix>/:section?/:slug?` with `sectionInPath`), and every folder is watched by the dev server.

## Routes and manifests

`markdownRoutes()` returns one route per folder, each rendering a `MarkdownView` guarded by `MarkdownGuards`:

```ts
export const appRoutes: Routes = {
  '/': () => new HomeView(),
  ...markdownRoutes(),
  '/404': () => new NotFoundView(),
}
```

The routes are [lazy](../API/VIEWS_AND_ROUTING/HOWDOI_REGISTER_A_ROUTE.md#lazy-routes): `MarkdownView` and its components are loaded the first time one of the folders' pages is visited, not with the rest of your app.

To build the folders' views yourself, pass a `view` factory. It is called with each folder's id (its `routePrefix`, its name by default). Return the view's Promise, to keep the routes lazy:

```ts
...markdownRoutes({
  view: (id) => import('./views/docs/docs.view.js').then((m) => new m.DocsView(id)),
}),
```

Returning the view itself (`(id) => new MarkdownView({ id, onContentRendered: highlight })`) works too, but puts `MarkdownView` back in the main bundle.

A route written after the spread with the same path also replaces the generated one; keep its guard (`MarkdownGuards.pageExists(id)`, or `MarkdownGuards.sectionPageExists(id)` with `sectionInPath`).

On every in-app navigation, `document.title` is set to the page's title (or the landing's), the same title as its prerendered SEO page.

### Loading

Each folder's manifest is loaded by its route's guard, the first time one of its pages is visited, then kept.

If it can't be loaded (a network error, a missing file), its pages show "This page couldn't be loaded." instead of their content, and the error is logged to the console. The next visit tries again.

`MarkdownManifestsService` gives access to every manifest, e.g. to list pages elsewhere in your app:

```ts
import { MarkdownManifestsService } from './markdown/markdown-manifests.service.js';

MarkdownManifestsService.ids;               // ['markdown-content', 'docs']
await MarkdownManifestsService.load('docs'); // loads it if needed, returns it
MarkdownManifestsService.get('docs').getPage('create-a-view');
```

To have every manifest available from the start, load them all before the app starts, in `main.ts`:

```ts
document.addEventListener('DOMContentLoaded', async () => {
  await MarkdownManifestsService.loadAll();
  new App();
});
```

## Customize the view and components

The feature's files are yours to edit, but changes to them show up as conflicts when `nutin-update` updates them. These options let you customize the pages from your own files instead:

| `MarkdownView` option | Description |
| --- | --- |
| `id` | The folder's `routePrefix` |
| `template` | Your own layout: `data-component="markdown-content"` is where the page (or the landing) goes, `data-component="markdown-nav"` the nav. Leave the nav out for pages without one |
| `viewName` | Defaults to `id` |
| `navComponent`, `contentComponent`, `landingComponent` | Your own component class for that part, usually a subclass of `MarkdownNavComponent`, `MarkdownContentComponent` or `MarkdownLandingComponent` |
| `onContentRendered(element, page)` | Called after a page's content is rendered, e.g. to highlight its code blocks |

```ts
// src/app/views/docs/docs.view.ts
import { MarkdownView } from '../../markdown/view/markdown.view.js';
import { DocsNavComponent } from '../../components/docs-nav/docs-nav.component.js';

export class DocsView extends MarkdownView {
  constructor(id: string) {
    super({ id, navComponent: DocsNavComponent, onContentRendered: (element) => highlight(element) });
  }
}
```

A component subclass can pass its own template as the constructor's third argument, built from the exported helpers (`renderNavSection`, `renderNavGroup`, `renderNavLink`, `renderToc`, `renderLandingSection`, ...):

```ts
import { html } from '../../../core/index.js';
import { IMarkdownNavConfig, MarkdownNavComponent, renderNavSection } from '../../markdown/components/markdown-nav/markdown-nav.component.js';

const templateFn = (config: IMarkdownNavConfig) => html`
  <nav class="docs-nav">${config.sections.map((section) => renderNavSection(section, config))}</nav>
`;

export class DocsNavComponent extends MarkdownNavComponent {
  constructor(mountTarget: HTMLElement, config: IMarkdownNavConfig) {
    super(mountTarget, config, templateFn);
  }
}
```

`MarkdownView`'s getters and helpers (`manifest`, `section`, `slug`, `page`, `navSections`, `pageHref()`, `isLanding`) are protected, so a subclass can use them, e.g. in its own `onEnter()`.

## Style the pages

The feature's styles have no specificity (they're wrapped in `:where()`): any rule of yours overrides them, whatever its order. Sizes are custom properties on `.markdown-view`:

```scss
.markdown-view {
  --markdown-gap: 3rem;          // between the nav, the content and its table of contents (2rem)
  --markdown-nav-width: 20rem;   // 16rem
  --markdown-toc-width: 12rem;   // 14rem
  --markdown-line-height: 1.8;   // page text (1.7)
}
```

| Part | Classes |
| --- | --- |
| View | `.markdown-view` |
| Nav | `.markdown-nav__container`, `.markdown-nav`, `.markdown-nav__section`, `.markdown-nav__section-title`, `.markdown-nav__group`, `.markdown-nav__group-title`, `.markdown-nav__link`, `.markdown-nav__link--active` |
| Content | `.markdown-content`, `.markdown-content__body`, `.markdown-content__empty`, `.markdown-content__error` |
| Table of contents | `.markdown-toc`, `.markdown-toc__title`, `.markdown-toc__item`, `.markdown-toc__item--depth-<2-6>` |
| Landing | `.markdown-landing`, `.markdown-landing__body`, `.markdown-landing__title`, `.markdown-landing__description`, `.markdown-landing__sections`, `.markdown-landing__section`, `.markdown-landing__section-title`, `.markdown-landing__section-description`, `.markdown-landing__group-title`, `.markdown-landing__pages`, `.markdown-landing__page`, `.markdown-landing__link`, `.markdown-landing__page-description` |

A landing looks like the folder's pages: `.markdown-landing` shares `.markdown-content`'s rules and `.markdown-landing__body` shares `.markdown-content__body`'s. Style them the same way in your own stylesheet, e.g. with Sass `@extend` in the file that styles your pages:

```scss
.markdown-landing { @extend .markdown-content; }
.markdown-landing__body { @extend .markdown-content__body; }
```

Below 700px the nav stacks above the content, and below 900px the table of contents moves above the page. To use other breakpoints, override `flex-direction` / `order` in your own media queries.

## Write pages

Without hub files, every `.md` file in the folder (subfolders included) is a page.

Subfolders become groups in the navigation, named after the folder: `getting-started/` is listed as "Getting started" (an all-lowercase name gets a capital first letter, `-` and `_` become spaces, `API/` stays "API"). A leading number orders folders without showing up: `01-basics/`, `02-advanced/`. Folders deeper down belong to their first-level folder's group, and pages at the folder's root come first, ungrouped. A page's frontmatter `group` puts it in another group.

Metadata is read from an optional YAML frontmatter, and falls back to the Markdown itself:

```md
---
title: My page        # defaults to the first "# Heading"
description: Summary  # defaults to the first paragraph (or list item), as plain text
slug: my-page         # defaults to the file name
order: 2              # pages are sorted by order, then by path
group: Guides         # groups pages under a heading in the navigation (default: the page's subfolder)
ogImage: /og/page.jpg # social preview image of the page's SEO HTML
---

# My page
```

Every `##` to `######` heading gets an `id`, made from its text: `## Été chaud` becomes `ete-chaud` (accents become plain letters), and a heading repeated on the same page gets `-1`, `-2`, ... (`usage`, `usage-1`). Pages with two or more of these headings show an "On this page" table of contents, as plain text.

### Linking pages

Link to another page with its relative path: `[Writing pages](./writing-pages.md#headings)`.
The link becomes an in-app route (`/markdown-content/writing-pages#headings`), navigated without reloading the page.

## Hub files

A hub file is a table of contents. When a folder has hub files, only the pages they list are compiled, in their order - each hub is one section of the navigation:

```md
# API

The API reference.

## Table of Contents

### Views

- [How do I create a view?](./API/HOWDOI_CREATE_A_VIEW.md)
- [How do I navigate?](./API/HOWDOI_NAVIGATE.md)

### Services

- [How do I create a service?](./API/HOWDOI_CREATE_A_SERVICE.md)
```

- The H1 is the section title, the first paragraph before `## Table of Contents` its description, as plain text. A frontmatter `title` or `description` takes precedence.
- Pages are listed as `- [Title](./path.md)` (`*` and `+` bullets work too), one per line. Any other list item under `## Table of Contents` is ignored, with a warning giving its line.
- `###` headings group the pages below them.
- Link titles are the pages' titles in the navigation, unless a page's frontmatter sets its own. The build warns when a link title differs from the page's H1.
- `.md` files no hub lists are skipped, with a warning.

This page, like the rest of this documentation, is written that way.

## Landing pages

By default, a folder's bare route (`/docs`) shows its first page. With `landing`, it shows an index instead:

```js
{ folder: 'docs', sectionInPath: true, landing: { title: 'Documentation', description: 'Guides and API.' } }
```

- With one hub (or none), the landing shows the hub's title and description, then its groups and pages, with each page's description. `landing: true` is enough.
- With several hubs, it lists every section. Its title is the folder's `routePrefix` unless you set `title`.
- With `sectionInPath`, `/docs` lists the sections, each linking to its own landing (`/docs/<section>`), which lists that section's pages.
- With `generateSEOFiles`, every landing is prerendered and listed in `sitemap.xml`, with the folder's `ogImage`.

## Check your content

The build fails on:
- a duplicate slug in a folder
- a page listed more than once in a folder's hub files (twice in one hub, or in two hubs)
- a link to a page that is not compiled
- a missing folder, hub file or listed page

Check every folder without building the app:

```bash
<pm> run markdown:check
```

## Translate pages (i18n)

With `i18n: true` (see [How do I use i18n?](HOWDOI_USE_I18N.md)), put each language's pages in a subfolder named after it, with the same file names (or frontmatter `slug`) in every language:

```
markdown-content/
  en/
    getting-started.md
    writing-pages.md
  fr/
    getting-started.md
```

- The default language (`config/languages.json`) defines the pages, their order and sections: a translation only translates them. A page or section that exists only in a translation fails the build.
- A page without a translation shows its default-language version, and the build lists those pages in a warning. Links from a translation to an untranslated page work the same way.
- Hub files go in each language folder, with the same file names. Their titles, descriptions and `### Group` headings are translated by position.
- Pages are served at `/<lang>/<routePrefix>/<slug>`, and links in compiled pages and the navigation carry the language. Switching language reloads the current page in the new one.
- A folder without language subfolders serves the same pages in every language. With `i18n: false`, a localized folder only compiles its default language.

The feature's own texts ("On this page", "Nothing here yet.", "This page couldn't be loaded.", the navigation's label) are translated from `src/app/markdown/locales/<lang>.json` (keys `onThisPage`, `empty`, `loadError`, `pages`). Only `en.json` ships; add a file per language, otherwise the English text is shown.

## SEO file generation

With `generateSEOFiles: true`, every page is prerendered at its own URL (`/<routePrefix>/<slug>/`, or `/<routePrefix>/<section>/<slug>/` with `sectionInPath`) and listed in `sitemap.xml`. With i18n, every language gets its page (`/<lang>/<routePrefix>/<slug>/`) with its translated title and description, and `hreflang` links between them; an untranslated page is published in the default language. Its `<title>`, description and `og:image` come from the page's metadata, so no `config/seo.json` entry is needed. A page without a description uses its section's, then its title, and the build warns about it.

To customize one page, add a `config/seo.json` route for its URL: it replaces the generated one.

```json
{ "path": "/docs/:section?/:slug?", "mockParams": { "section": "api", "slug": "navigate" }, "title": "Navigate API" }
```

Set `seo: false` on a folder to skip its pages. See [How do I use SEO file generation?](HOWDOI_USE_SEO_FILE_GENERATION.md).

## Important

- The page HTML is injected as trusted content: only compile Markdown you wrote.

## Limitations

- Code blocks are not syntax-highlighted: highlight them in `onContentRendered` (see [Customize the view and components](#customize-the-view-and-components)).
