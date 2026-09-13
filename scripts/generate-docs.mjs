#!/usr/bin/env node
// Documentation compiler: reads each collection's Markdown tree under `resources/`
// and produces one manifest per collection (e.g. `apps/website/generated/docs.json`)
// that the website consumes as a normal build input. `resources/<collection>/` is the
// only source of truth for that collection's content — this script is the sole place
// that understands its filesystem layout.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Checked longest/most-specific first. HOWDOI_ is dropped outright (the remaining
// verb phrase reads fine alone, e.g. "create-a-component"); the WHAT* prefixes are
// normalized instead of dropped, since "a-component" alone is a poor slug.
// docs/-specific — the other collections' filenames don't use this convention.
const DOCS_PREFIX_REPLACEMENTS = [
  ['HOWDOI_', ''],
  ['WHATARE_', 'what-are-'],
  ['WHATIS_', 'what-is-'],
  ['WHAT_', 'what-'],
];

const stripDocsHubTitle = (t) => t.replace(/^Nutin\s*-\s*/i, '').replace(/\s*documentation$/i, '');
const identity = (t) => t;

const COLLECTIONS = [
  {
    id: 'docs',
    dir: path.join(ROOT, 'resources', 'docs'),
    hubFiles: ['API.md', 'OPTIONS_AND_FEATURES.md', 'TESTING.md', 'TOOLS.md'],
    output: path.join(ROOT, 'apps', 'website', 'generated', 'docs.json'),
    stripH1: stripDocsHubTitle,
    prefixReplacements: DOCS_PREFIX_REPLACEMENTS,
  },
  {
    id: 'changelog',
    dir: path.join(ROOT, 'resources', 'changelog'),
    hubFiles: ['CHANGELOG.md'],
    output: path.join(ROOT, 'apps', 'website', 'generated', 'changelog.json'),
    stripH1: identity,
    prefixReplacements: [],
  },
  {
    id: 'tutorial',
    dir: path.join(ROOT, 'resources', 'tutorial'),
    hubFiles: ['TUTORIAL.md'],
    output: path.join(ROOT, 'apps', 'website', 'generated', 'tutorial.json'),
    stripH1: identity,
    prefixReplacements: [],
  },
  {
    id: 'articles',
    dir: path.join(ROOT, 'resources', 'articles'),
    hubFiles: ['ARTICLES.md'],
    output: path.join(ROOT, 'apps', 'website', 'generated', 'articles.json'),
    stripH1: identity,
    prefixReplacements: [],
  },
  {
    id: 'guides',
    dir: path.join(ROOT, 'resources', 'guides'),
    hubFiles: ['GUIDES.md'],
    output: path.join(ROOT, 'apps', 'website', 'generated', 'guides.json'),
    stripH1: identity,
    prefixReplacements: [],
  },
];

function fail(message) {
  console.error(`\x1b[1;31mgenerate-docs - Error: ${message}\x1b[0m`);
  process.exit(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugFromFilename(fileName, prefixReplacements) {
  const base = fileName.replace(/\.md$/, '');
  const [prefix, replacement] = prefixReplacements.find(([p]) => base.startsWith(p)) ?? ['', ''];
  const rest = base.slice(prefix.length).toLowerCase().replace(/_/g, '-');
  return replacement ? `${replacement}${rest}` : slugify(rest);
}

// --- Pass 1: parse a collection's hub files for section/group/page structure and ordering ---

function parseHub(collection, hubFile) {
  const hubPath = path.join(collection.dir, hubFile);
  const raw = fs.readFileSync(hubPath, 'utf8');
  const lines = raw.split('\n');

  const id = slugify(path.basename(hubFile, '.md').replace(/_/g, ' '));
  let title = id;
  const descriptionLines = [];
  const groups = [];
  let currentGroup = null;
  let sawToc = false;

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+?)\s*$/);
    const h2Toc = line.match(/^##\s+Table of Contents\s*$/i);
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    const item = line.match(/^-\s+\[(.+?)\]\((.+?)\)\s*$/);

    if (h1 && title === id) {
      title = collection.stripH1(h1[1].trim());
      continue;
    }
    if (h2Toc) {
      sawToc = true;
      continue;
    }
    if (!sawToc) {
      if (line.trim().length) descriptionLines.push(line.trim());
      continue;
    }
    if (h3) {
      currentGroup = { id: slugify(h3[1]), title: h3[1].trim(), pages: [] };
      groups.push(currentGroup);
      continue;
    }
    if (item) {
      const [, linkTitle, relPath] = item;
      const resolved = path.normalize(path.join(collection.dir, relPath));
      const target = currentGroup ?? (currentGroup = { id: null, title: null, pages: [] });
      if (!groups.includes(target)) groups.push(target);
      target.pages.push({ title: linkTitle.trim(), source: resolved });
    }
  }

  return {
    id,
    title,
    description: descriptionLines.join(' '),
    groups,
  };
}

// --- Build the sourcePath -> slug lookup for one collection, and validate no collisions ---

function buildSlugMap(collection, hubs) {
  const slugMap = new Map(); // absolute source path -> slug
  const seenSlugs = new Map(); // slug -> source path (for collision detection)

  for (const hub of hubs) {
    for (const group of hub.groups) {
      for (const page of group.pages) {
        const fileName = path.basename(page.source);
        const slug = slugFromFilename(fileName, collection.prefixReplacements);

        if (seenSlugs.has(slug) && seenSlugs.get(slug) !== page.source) {
          fail(`Duplicate slug "${slug}" produced by both "${seenSlugs.get(slug)}" and "${page.source}"`);
        }
        seenSlugs.set(slug, page.source);
        slugMap.set(page.source, slug);
      }
    }
  }

  return slugMap;
}

// --- Pass 2: convert each leaf page's Markdown to HTML, rewriting headings/links ---

function renderPage(collection, sourcePath, slugMap) {
  const dir = path.dirname(sourcePath);
  const markdown = fs.readFileSync(sourcePath, 'utf8');
  const headings = [];

  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const id = slugify(token.text);
        headings.push({ depth: token.depth, text: token.text, id });
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
      },
      link(token) {
        const text = this.parser.parseInline(token.tokens);
        let href = token.href;
        let internalSlug = null;

        if (!/^[a-z]+:/i.test(href) && href.includes('.md')) {
          const [rawPath, fragment] = href.split('#');
          const resolved = path.normalize(path.join(dir, rawPath));
          const slug = slugMap.get(resolved);

          if (!slug) {
            fail(
              `Unresolvable internal link "${href}" in "${path.relative(ROOT, sourcePath)}" ` +
              `(resolved to "${path.relative(ROOT, resolved)}", no matching doc page)`
            );
          }
          internalSlug = slug;
          href = fragment ? `/${collection.id}/${slug}#${fragment}` : `/${collection.id}/${slug}`;
        }

        const titleAttr = token.title ? ` title="${token.title}"` : '';
        // Internal links carry a data-event hook so DocContentComponent can route them
        // through the SPA router instead of triggering a full page reload.
        const navAttrs = internalSlug
          ? ` data-event="click:_navigateTo:@attr:href"`
          : '';
        return `<a href="${href}"${titleAttr}${navAttrs}>${text}</a>`;
      },
    },
  });

  const html = marked.parse(markdown).trim();

  // Title = first H1; description = first non-empty prose line found after it.
  const lines = markdown.split('\n');
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  const title = h1Index >= 0 ? lines[h1Index].replace(/^#\s+/, '').trim() : path.basename(sourcePath, '.md');
  const descriptionLine = lines
    .slice(h1Index + 1)
    .find((l) => l.trim().length && !/^#{1,6}\s/.test(l) && !l.trim().startsWith('```'));
  const description = descriptionLine ? descriptionLine.trim() : '';

  return { title, description, html, headings: headings.filter((h) => h.depth > 1) };
}

function compileCollection(collection) {
  if (!fs.existsSync(collection.dir)) fail(`"${collection.id}" directory not found at "${collection.dir}"`);

  const hubs = collection.hubFiles.map((hubFile) => parseHub(collection, hubFile));
  const slugMap = buildSlugMap(collection, hubs);

  const sections = [];
  const pages = {};

  for (const hub of hubs) {
    const hasNamedGroups = hub.groups.some((g) => g.id);
    const section = {
      id: hub.id,
      title: hub.title,
      description: hub.description,
      groups: hasNamedGroups
        ? hub.groups.map((g) => ({ id: g.id, title: g.title, pages: g.pages.map((p) => slugMap.get(p.source)) }))
        : undefined,
      pages: hasNamedGroups ? undefined : hub.groups.flatMap((g) => g.pages.map((p) => slugMap.get(p.source))),
    };
    sections.push(section);

    let order = 0;
    for (const group of hub.groups) {
      for (const pageRef of group.pages) {
        const slug = slugMap.get(pageRef.source);
        const rendered = renderPage(collection, pageRef.source, slugMap);

        if (rendered.title !== pageRef.title) {
          console.warn(
            `\x1b[33mgenerate-docs - warning: title mismatch for "${collection.id}/${slug}": ` +
            `hub TOC says "${pageRef.title}", H1 says "${rendered.title}"\x1b[0m`
          );
        }

        pages[slug] = {
          slug,
          title: pageRef.title,
          description: rendered.description,
          section: hub.id,
          group: group.id,
          order: order++,
          source: path.relative(ROOT, pageRef.source),
          headings: rendered.headings,
          html: rendered.html,
        };
      }
    }
  }

  fs.mkdirSync(path.dirname(collection.output), { recursive: true });
  fs.writeFileSync(collection.output, JSON.stringify({ sections, pages }, null, 2));
  console.log(
    `\x1b[1;32mgenerate-docs: wrote ${Object.keys(pages).length} "${collection.id}" pages to ` +
    `${path.relative(ROOT, collection.output)}\x1b[0m`
  );
}

function main() {
  for (const collection of COLLECTIONS) compileCollection(collection);
}

main();
