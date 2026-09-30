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
- `markdownSources` to `nutin.config.js`, pointing at a sample `content/` folder
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

`/content` now shows the sample folder's first page, and `/content/<slug>` each page.

## Configure folders

Folders are listed in `nutin.config.js`'s `markdownSources.sourceFolders`, as a path or as an object:

```js
export default {
  // ...
  markdownSources: {
    sourceFolders: [
      'content',
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

A route written after the spread with the same path replaces the generated one - e.g. to give a folder its own layout:

```ts
'/docs/:section?/:slug?': {
  view: () => new MarkdownView({ id: 'docs', template: docsTemplate }),
  guards: [MarkdownGuards.sectionPageExists('docs')],
},
```

A custom template must contain `data-component="markdown-nav"` and `data-component="markdown-content"`. `id` is the folder's `routePrefix` (its name by default).

### Loading

Each folder's manifest is loaded by its route's guard, the first time one of its pages is visited, then kept.

`MarkdownManifestsService` gives access to every manifest, e.g. to list pages elsewhere in your app:

```ts
import { MarkdownManifestsService } from './markdown/markdown-manifests.service.js';

MarkdownManifestsService.ids;               // ['content', 'docs']
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

## Write pages

Without hub files, every `.md` file in the folder (subfolders included) is a page.

Metadata is read from an optional YAML frontmatter, and falls back to the Markdown itself:

```md
---
title: My page        # defaults to the first "# Heading"
description: Summary  # defaults to the first paragraph
slug: my-page         # defaults to the file name
order: 2              # pages are sorted by order, then by path
group: Guides         # groups pages under a heading in the navigation
---

# My page
```

Every `##` to `######` heading gets an `id`. Pages with two or more of them show an "On this page" table of contents.

### Linking pages

Link to another page with its relative path: `[Writing pages](./writing-pages.md#headings)`.
The link becomes an in-app route (`/content/writing-pages#headings`), navigated without reloading the page.

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

- The H1 is the section title, the text before `## Table of Contents` its description. A frontmatter `title` or `description` takes precedence.
- `###` headings group the pages below them.
- Link titles are the pages' titles in the navigation, unless a page's frontmatter sets its own. The build warns when a link title differs from the page's H1.
- `.md` files no hub lists are skipped, with a warning.

This page, like the rest of this documentation, is written that way.

## Check your content

The build fails on:
- a duplicate slug in a folder
- a link to a page that is not compiled
- a missing folder, hub file or listed page

Check every folder without building the app:

```bash
<pm> run markdown:check
```

## Important

- The page HTML is injected as trusted content: only compile Markdown you wrote.

## Limitations

- Does not support i18n yet.
- Pages are rendered client-side only: SEO file generation does not pre-render them yet.
- Code blocks are not syntax-highlighted - add a highlighter in `MarkdownContentComponent`'s `onAfterRender()` if you need one.
