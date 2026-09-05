#!/usr/bin/env node
// Documentation compiler: reads the repo's `docs/` Markdown tree and produces a single
// manifest (`apps/website/generated/docs.json`) that the website consumes as a normal
// build input. `docs/` is the only source of truth for documentation content — this
// script is the sole place that understands its filesystem layout.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_FILE = path.join(ROOT, 'apps', 'website', 'generated', 'docs.json');

const HUB_FILES = ['API.md', 'OPTIONS_AND_FEATURES.md', 'TESTING.md', 'TOOLS.md'];

// Checked longest/most-specific first. HOWDOI_ is dropped outright (the remaining
// verb phrase reads fine alone, e.g. "create-a-component"); the WHAT* prefixes are
// normalized instead of dropped, since "a-component" alone is a poor slug.
const PREFIX_REPLACEMENTS = [
  ['HOWDOI_', ''],
  ['WHATARE_', 'what-are-'],
  ['WHATIS_', 'what-is-'],
  ['WHAT_', 'what-'],
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

function slugFromFilename(fileName) {
  const base = fileName.replace(/\.md$/, '');
  const [prefix, replacement] = PREFIX_REPLACEMENTS.find(([p]) => base.startsWith(p)) ?? ['', ''];
  const rest = base.slice(prefix.length).toLowerCase().replace(/_/g, '-');
  return `${replacement}${rest}`;
}

// --- Pass 1: parse the 4 hub files for section/group/page structure and ordering ---

function parseHub(hubFile) {
  const hubPath = path.join(DOCS_DIR, hubFile);
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
      // Hub H1s are all "Nutin - <Section> documentation" — strip the boilerplate
      // so the site nav shows a short section label instead of repeating it 4x.
      title = h1[1].trim().replace(/^Nutin\s*-\s*/i, '').replace(/\s*documentation$/i, '');
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
      const resolved = path.normalize(path.join(DOCS_DIR, relPath));
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

// --- Build the sourcePath -> slug lookup, and validate no collisions ---

function buildSlugMap(hubs) {
  const slugMap = new Map(); // absolute source path -> slug
  const seenSlugs = new Map(); // slug -> source path (for collision detection)

  for (const hub of hubs) {
    for (const group of hub.groups) {
      for (const page of group.pages) {
        const fileName = path.basename(page.source);
        const slug = slugFromFilename(fileName);

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

function renderPage(sourcePath, slugMap) {
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
          href = fragment ? `/docs/${slug}#${fragment}` : `/docs/${slug}`;
        }

        const titleAttr = token.title ? ` title="${token.title}"` : '';
        // Internal links carry a data-event hook so DocContentComponent can route them
        // through the SPA router instead of triggering a full page reload.
        const navAttrs = internalSlug
          ? ` data-slug="${internalSlug}" data-event="click:_navigateTo:@dataset:slug"`
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

function main() {
  if (!fs.existsSync(DOCS_DIR)) fail(`docs/ directory not found at "${DOCS_DIR}"`);

  const hubs = HUB_FILES.map(parseHub);
  const slugMap = buildSlugMap(hubs);

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
        const rendered = renderPage(pageRef.source, slugMap);

        if (rendered.title !== pageRef.title) {
          console.warn(
            `\x1b[33mgenerate-docs - warning: title mismatch for "${slug}": ` +
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

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ sections, pages }, null, 2));
  console.log(`\x1b[1;32mgenerate-docs: wrote ${Object.keys(pages).length} pages to ${path.relative(ROOT, OUTPUT_FILE)}\x1b[0m`);
}

main();
