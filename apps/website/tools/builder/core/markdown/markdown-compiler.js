import * as fs from 'fs';
import path from 'path';

// Compiles one `markdownSources.sourceFolders` entry into a manifest:
//   { sections: [{ id, title, description, groups? | pages? }], pages: { [slug]: page } }
//
// Two layouts are supported per folder:
// - Hub mode: one or more hub files (a Markdown TOC: H1, description, "## Table of
//   Contents", optional "### Group" headings and "- [Title](./path.md)" bullets). Each hub
//   is one section; only the pages it lists are compiled, in its order.
// - Frontmatter mode (no hub file): every .md file under the folder, in a single "index"
//   section, grouped by frontmatter `group` and sorted by frontmatter `order`, then path.
//
// Page metadata comes from YAML frontmatter first (title, description, slug, order, group, ogImage),
// then the hub entry, then the Markdown itself (first H1, first prose line, file name).
//
// `marked` (Marked class) and `gray-matter` are injected: they are installed on demand by
// generate-markdown-pages.js, so this module must not import them.

export class MarkdownCompileError extends Error {}

function fail(message) {
  throw new MarkdownCompileError(message);
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugFromFilename(fileName, prefixReplacements = []) {
  const base = fileName.replace(/\.md$/i, '');
  const [prefix, replacement] = prefixReplacements.find(([p]) => base.startsWith(p)) ?? ['', ''];
  const rest = base.slice(prefix.length).toLowerCase().replace(/_/g, '-');
  return replacement ? `${replacement}${rest}` : slugify(rest);
}

// Heading ids: accents become their base letter (é → e) instead of being dropped, and a
// repeated heading gets a -1, -2, ... suffix (GitHub style). `seen` is scoped to one page.
export function headingId(text, seen) {
  const base = slugify(String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g, ''));
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count ? `${base}-${count}` : base;
}

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const toPosix = (p) => p.split(path.sep).join('/');

// Accepts a `sourceFolders` entry (a folder path, or an options object) and resolves defaults.
export function normalizeSource(entry, root) {
  const options = typeof entry === 'string' ? { folder: entry } : entry;
  if (!options || typeof options.folder !== 'string' || !options.folder.trim()) {
    fail(`Invalid "markdownSources.sourceFolders" entry ${JSON.stringify(entry)}: expected a folder path or { folder, ... }`);
  }

  const dir = path.resolve(root, options.folder);
  // The id names the manifest (/generated/<id>.json) and its routes. src/app/markdown/
  // markdown-sources.ts derives it again at runtime from nutin.config.js: keep both rules identical.
  const id = options.routePrefix ?? slugify(path.basename(dir));
  if (!/^[a-z0-9-]+$/.test(id)) {
    fail(`"routePrefix" for "${options.folder}" must only contain lowercase letters, digits and dashes (got "${id}")`);
  }

  // Convention: a hub named after the folder, e.g. articles/ARTICLES.md.
  const conventionalHub = `${path.basename(dir).toUpperCase().replace(/[^A-Z0-9]+/g, '_')}.md`;
  let hubFiles = options.hubFiles;
  if (hubFiles === undefined) {
    hubFiles = fs.existsSync(path.join(dir, conventionalHub)) ? [conventionalHub] : [];
  } else if (!Array.isArray(hubFiles)) {
    fail(`"hubFiles" for "${options.folder}" must be an array of file names`);
  }

  const prefixReplacements = options.prefixReplacements ?? [];
  if (!Array.isArray(prefixReplacements) || !prefixReplacements.every((pair) => Array.isArray(pair) && pair.length === 2)) {
    fail(`"prefixReplacements" for "${options.folder}" must be an array of [prefix, replacement] pairs`);
  }

  if (options.seo !== undefined && typeof options.seo !== 'boolean') {
    fail(`"seo" for "${options.folder}" must be true or false`);
  }

  if (options.ogImage !== undefined && (typeof options.ogImage !== 'string' || !options.ogImage.trim())) {
    fail(`"ogImage" for "${options.folder}" must be an image path, e.g. "/assets/images/og.jpg"`);
  }

  let landing = null;
  if (options.landing === true) {
    landing = {};
  } else if (options.landing !== undefined && options.landing !== false) {
    const valid = typeof options.landing === 'object'
      && ['title', 'description'].every((key) => options.landing[key] === undefined || typeof options.landing[key] === 'string');
    if (!valid) fail(`"landing" for "${options.folder}" must be true, false or { title?, description? }`);
    landing = { title: options.landing.title, description: options.landing.description };
  }

  return {
    folder: options.folder,
    dir,
    id,
    hubFiles,
    sectionInPath: options.sectionInPath === true,
    prefixReplacements,
    // With generateSEOFiles, every page gets prerendered HTML and a sitemap entry unless false.
    seo: options.seo !== false,
    // Default og:image of the folder's SEO pages; a page's frontmatter "ogImage" wins.
    ogImage: options.ogImage,
    // Opt-in: the bare route shows an index of the hub(s) instead of the first page.
    landing,
    // Kept to resolve hub files again inside each language subfolder (see languageSource()).
    hubFilesOption: options.hubFiles,
    conventionalHub,
  };
}

// --- Hub parsing ---

function parseHub(source, hubFile, context) {
  const hubPath = path.join(source.dir, hubFile);
  if (!fs.existsSync(hubPath)) fail(`Hub file "${hubFile}" not found in "${source.folder}"`);

  const raw = fs.readFileSync(hubPath, 'utf8');
  const { data, content } = context.matter(raw);
  // Line numbers in warnings count from the top of the file, frontmatter included.
  const lineOffset = raw.split('\n').length - content.split('\n').length;
  const warnings = [];
  const id = data.slug ?? slugify(path.basename(hubFile, path.extname(hubFile)).replace(/_/g, ' '));
  let title = null;
  const descriptionLines = [];
  const groups = [];
  let currentGroup = null;
  let sawToc = false;

  content.split('\n').forEach((line, index) => {
    const h1 = line.match(/^#\s+(.+?)\s*$/);
    const h2Toc = line.match(/^##\s+Table of Contents\s*$/i);
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    const item = line.match(/^[-*+]\s+\[(.+?)\]\((.+?)\)\s*$/);

    if (h1 && title === null) {
      title = h1[1].trim();
      return;
    }
    if (h2Toc) {
      sawToc = true;
      return;
    }
    if (!sawToc) {
      descriptionLines.push(line);
      return;
    }
    if (h3) {
      currentGroup = { id: slugify(h3[1]), title: h3[1].trim(), pages: [] };
      groups.push(currentGroup);
      return;
    }
    if (item) {
      const [, linkTitle, relPath] = item;
      const target = currentGroup ?? (currentGroup = { id: null, title: null, pages: [] });
      if (!groups.includes(target)) groups.push(target);
      target.pages.push({ title: linkTitle.trim(), source: path.normalize(path.join(source.dir, relPath)) });
      return;
    }
    // Anything else that looks like a list item under the TOC isn't a page: say so.
    if (/^\s*(?:[-*+]|\d+[.)])\s+\S/.test(line)) {
      warnings.push(`"${hubFile}" line ${lineOffset + index + 1} is not a page entry ("- [Title](./page.md)") and was ignored: ${line.trim()}`);
    }
  });

  return {
    id,
    title: data.title ?? title ?? id,
    description: data.description ?? firstProse(descriptionLines.join('\n'), context.Marked),
    groups,
    warnings,
  };
}

// --- Page reading & rendering ---

function listMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listMarkdownFiles(fullPath));
    else if (/\.md$/i.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function readPage(sourcePath, source, matter) {
  if (!fs.existsSync(sourcePath)) fail(`Page "${path.relative(source.dir, sourcePath)}" listed in "${source.folder}" does not exist`);
  const { data, content } = matter(fs.readFileSync(sourcePath, 'utf8'));
  return { data, body: content };
}

// Plain text of one line of inline Markdown: link/image text, no emphasis or code marks.
// Derived descriptions end up in <meta name="description"> and nav text.
export function stripInlineMarkdown(text) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    // Underscores only emphasize at word boundaries: snake_case_names stay intact.
    .replace(/(^|\W)__(.+?)__(?=\W|$)/g, '$1$2')
    .replace(/(^|\W)_(.+?)_(?=\W|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Plain text of inline Markdown that may also contain HTML tags. Tags inside `code spans`
// are text, not markup: they are kept.
export function plainText(text) {
  const withoutTags = String(text)
    .split(/(`[^`]*`)/)
    .map((part, index) => (index % 2 ? part : part.replace(/<[^>]*>/g, ' ')))
    .join('');
  return stripInlineMarkdown(withoutTags);
}

// Plain text of the first prose block of some Markdown: a paragraph, or a list's first item,
// whichever comes first. Headings, code, tables and HTML blocks are skipped.
export function firstProse(markdown, Marked) {
  const block = new Marked({ gfm: true }).lexer(markdown).find((token) => token.type === 'paragraph' || token.type === 'list');
  if (!block) return '';
  return plainText(block.type === 'list' ? block.items[0]?.text ?? '' : block.text);
}

// Title = first H1; description = the first paragraph or list item after it.
function deriveMeta(body, sourcePath, Marked) {
  const lines = body.split('\n');
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l));
  const title = h1Index >= 0 ? lines[h1Index].replace(/^#\s+/, '').trim() : path.basename(sourcePath, path.extname(sourcePath));
  return { title, description: firstProse(lines.slice(h1Index + 1).join('\n'), Marked) };
}

function renderHtml(body, sourcePath, hrefMap, context) {
  const dir = path.dirname(sourcePath);
  const headings = [];
  const seenIds = new Map();
  // Reported after parsing: marked appends "Please report this to marked" to errors
  // thrown from a renderer, and one pass can list every broken link of the page.
  const unresolvedLinks = [];
  const marked = new context.Marked({ gfm: true });

  marked.use({
    renderer: {
      heading(token) {
        const text = this.parser.parseInline(token.tokens);
        const id = headingId(plainText(token.text), seenIds);
        headings.push({ depth: token.depth, text: plainText(token.text), id });
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
      },
      link(token) {
        const text = this.parser.parseInline(token.tokens);
        let href = token.href;
        let isInternal = false;

        // Relative links to other .md pages become SPA routes.
        if (!/^[a-z]+:/i.test(href) && href.includes('.md')) {
          const [rawPath, fragment] = href.split('#');
          const resolved = path.normalize(path.join(dir, rawPath));
          // fallbackHref: a translation linking to a page it doesn't have points at the
          // default-language page instead (see compileLanguages()).
          const pageHref = hrefMap.get(resolved) ?? context.fallbackHref?.(resolved);

          if (pageHref) {
            isInternal = true;
            href = fragment ? `${pageHref}#${fragment}` : pageHref;
          } else {
            unresolvedLinks.push(`"${href}" (resolved to "${toPosix(path.relative(context.root, resolved))}")`);
          }
        }

        const titleAttr = token.title ? ` title="${escapeAttr(token.title)}"` : '';
        // Lets MarkdownContentComponent route the click through the SPA router.
        const navAttrs = isInternal ? ' data-event="click:_navigateTo:@attr:href"' : '';
        return `<a href="${href}"${titleAttr}${navAttrs}>${text}</a>`;
      },
    },
  });

  const html = marked.parse(body).trim();
  if (unresolvedLinks.length) {
    fail(
      `Unresolvable internal link ${unresolvedLinks.join(', ')} in "${toPosix(path.relative(context.root, sourcePath))}" ` +
      `— ${unresolvedLinks.length > 1 ? 'these are not compiled pages' : 'not a compiled page'}`
    );
  }
  return { html, headings: headings.filter((h) => h.depth > 1) };
}

// --- Section layout (hub mode vs frontmatter mode) ---

// Returns [{ id, title, description, groups: [{ id, title, pages: [{ source, data, body, hubTitle? }] }] }]
function collectHubSections(source, context) {
  const hubBySource = new Map();
  return source.hubFiles.map((hubFile) => {
    const hub = parseHub(source, hubFile, context);
    for (const ref of hub.groups.flatMap((group) => group.pages)) {
      const other = hubBySource.get(ref.source);
      if (other) {
        const page = toPosix(path.relative(context.root, ref.source));
        fail(`"${page}" is listed in ${other === hubFile ? `"${hubFile}" twice` : `both "${other}" and "${hubFile}"`} in "${source.folder}" — a page belongs to one place`);
      }
      hubBySource.set(ref.source, hubFile);
    }
    return {
      ...hub,
      groups: hub.groups.map((group) => ({
        ...group,
        pages: group.pages.map((ref) => ({ source: ref.source, hubTitle: ref.title, ...readPage(ref.source, source, context.matter) })),
      })),
    };
  });
}

function collectFrontmatterSection(source, context) {
  const pages = listMarkdownFiles(source.dir)
    .map((file) => ({ source: file, ...readPage(file, source, context.matter) }))
    .sort((a, b) => {
      const orderA = typeof a.data.order === 'number' ? a.data.order : Infinity;
      const orderB = typeof b.data.order === 'number' ? b.data.order : Infinity;
      if (orderA !== orderB) return orderA < orderB ? -1 : 1;
      return a.source.localeCompare(b.source);
    });

  // Ungrouped pages first, then groups in order of their first page.
  const groups = [];
  const byId = new Map();
  for (const page of pages) {
    const groupTitle = page.data.group ? String(page.data.group) : null;
    const groupId = groupTitle ? slugify(groupTitle) : null;
    if (!byId.has(groupId)) {
      const group = { id: groupId, title: groupTitle, pages: [] };
      byId.set(groupId, group);
      if (groupId === null) groups.unshift(group);
      else groups.push(group);
    }
    byId.get(groupId).pages.push(page);
  }

  return [{ id: 'index', title: source.sectionTitle ?? path.basename(source.dir), description: '', groups }];
}

// --- Landing ---

// The landing's title and description, written into the manifest of a source with "landing".
// A single section (one hub, or frontmatter mode) provides both; with several sections, the
// folder's id and an empty description, unless the "landing" option sets them.
export function landingFor(source, sections) {
  if (!source.landing) return undefined;
  const single = sections.length === 1 ? sections[0] : null;
  return {
    title: source.landing.title ?? single?.title ?? source.id,
    description: source.landing.description ?? single?.description ?? '',
  };
}

// --- Entry point ---

export function compileSource(source, context) {
  if (!fs.existsSync(source.dir) || !fs.statSync(source.dir).isDirectory()) {
    fail(`Markdown folder "${source.folder}" not found`);
  }

  const sections = source.hubFiles.length ? collectHubSections(source, context) : collectFrontmatterSection(source, context);
  const warnings = sections.flatMap((section) => section.warnings ?? []);

  // Pass 1: slugs + hrefs for every page, so links can be resolved across sections.
  const slugBySource = new Map();
  const sourceBySlug = new Map();
  const hrefMap = new Map();
  for (const section of sections) {
    // linkPrefix: '/<lang>' with i18n, so compiled links (and prerendered HTML) carry the locale.
    const base = `${context.linkPrefix ?? ''}/${source.id}`;
    const prefix = source.sectionInPath ? `${base}/${section.id}` : base;
    for (const group of section.groups) {
      for (const page of group.pages) {
        const slug = page.data.slug ? String(page.data.slug) : slugFromFilename(path.basename(page.source), source.prefixReplacements);
        const owner = sourceBySlug.get(slug);
        if (owner && owner !== page.source) {
          fail(`Duplicate slug "${slug}" in "${source.folder}", produced by both "${toPosix(path.relative(context.root, owner))}" and "${toPosix(path.relative(context.root, page.source))}"`);
        }
        sourceBySlug.set(slug, page.source);
        slugBySource.set(page.source, slug);
        hrefMap.set(page.source, `${prefix}/${slug}`);
      }
    }
  }

  // Pass 2: render.
  const manifestSections = [];
  const pages = {};
  for (const section of sections) {
    const hasNamedGroups = section.groups.some((g) => g.id);
    manifestSections.push({
      id: section.id,
      title: section.title,
      description: section.description,
      groups: hasNamedGroups
        ? section.groups.map((g) => ({ id: g.id, title: g.title, pages: g.pages.map((p) => slugBySource.get(p.source)) }))
        : undefined,
      pages: hasNamedGroups ? undefined : section.groups.flatMap((g) => g.pages.map((p) => slugBySource.get(p.source))),
    });

    let order = 0;
    for (const group of section.groups) {
      for (const page of group.pages) {
        const slug = slugBySource.get(page.source);
        const derived = deriveMeta(page.body, page.source, context.Marked);
        const { html, headings } = renderHtml(page.body, page.source, hrefMap, context);

        if (page.hubTitle && !page.data.title && page.hubTitle !== derived.title) {
          warnings.push(`Title mismatch for "${source.id}/${slug}": hub says "${page.hubTitle}", H1 says "${derived.title}"`);
        }

        pages[slug] = {
          slug,
          title: page.data.title ?? page.hubTitle ?? derived.title,
          description: page.data.description ?? derived.description,
          section: section.id,
          group: group.id,
          order: order++,
          source: toPosix(path.relative(context.root, page.source)),
          headings,
          html,
          ...(page.data.ogImage ? { ogImage: String(page.data.ogImage) } : {}),
        };
      }
    }
  }

  // Hub mode only compiles listed pages — flag the ones no hub links to.
  if (source.hubFiles.length) {
    const hubPaths = new Set(source.hubFiles.map((hub) => path.normalize(path.join(source.dir, hub))));
    for (const file of listMarkdownFiles(source.dir)) {
      if (!hubPaths.has(file) && !slugBySource.has(file)) {
        warnings.push(`"${toPosix(path.relative(context.root, file))}" is not listed in any hub file of "${source.folder}" and was skipped`);
      }
    }
  }

  const landing = landingFor(source, manifestSections);
  return { manifest: { sections: manifestSections, pages, ...(landing ? { landing } : {}) }, warnings, hrefBySource: hrefMap };
}

// --- Languages (i18n) ---

const isDirectory = (dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory();

// A source is localized when it has a subfolder named after the default language,
// e.g. markdown-content/en/ (+ markdown-content/fr/, ...).
export function isLocalized(source, defaultLanguage) {
  return isDirectory(path.join(source.dir, defaultLanguage));
}

// The source restricted to one language subfolder. Hub files are resolved again inside it,
// and a frontmatter-mode section keeps the source folder's name as its title.
function languageSource(source, lang) {
  const dir = path.join(source.dir, lang);
  const hubFiles = source.hubFilesOption ?? (fs.existsSync(path.join(dir, source.conventionalHub)) ? [source.conventionalHub] : []);
  return { ...source, dir, folder: `${source.folder}/${lang}`, hubFiles, sectionTitle: path.basename(source.dir) };
}

// One translation laid over the default-language manifest. The default language defines the
// pages, their order and sections; a translation may only translate them. Missing pages keep
// the default-language page, flagged `fallback: true`.
function mergeTranslation(base, own, { source, lang, defaultLanguage }) {
  const baseSectionIds = new Set(base.sections.map((section) => section.id));
  const extraSection = own.sections.find((section) => !baseSectionIds.has(section.id));
  if (extraSection) {
    fail(`Section "${extraSection.id}" exists in "${source.folder}/${lang}" but not in "${source.folder}/${defaultLanguage}" — the default language defines the sections`);
  }
  const extraPage = Object.values(own.pages).find((page) => !base.pages[page.slug]);
  if (extraPage) {
    fail(`"${extraPage.source}" has no "${defaultLanguage}" counterpart (slug "${extraPage.slug}") — add it to "${source.folder}/${defaultLanguage}" too`);
  }

  // Translated groups are matched by the pages they hold, since their ids come from
  // their (translated) titles.
  const translatedGroupTitle = (ownSection, group) =>
    ownSection?.groups?.find((ownGroup) => ownGroup.pages.some((slug) => group.pages.includes(slug)))?.title ?? group.title;

  const sections = base.sections.map((section) => {
    const ownSection = own.sections.find((candidate) => candidate.id === section.id);
    return {
      ...section,
      title: ownSection?.title ?? section.title,
      description: ownSection?.description || section.description,
      groups: section.groups?.map((group) => ({ ...group, title: translatedGroupTitle(ownSection, group) })),
    };
  });

  const pages = {};
  const missing = [];
  for (const [slug, basePage] of Object.entries(base.pages)) {
    const ownPage = own.pages[slug];
    if (ownPage) {
      pages[slug] = { ...ownPage, section: basePage.section, group: basePage.group, order: basePage.order };
    } else {
      pages[slug] = { ...basePage, fallback: true };
      missing.push(slug);
    }
  }

  const landing = landingFor(source, sections);
  return { manifest: { sections, pages, ...(landing ? { landing } : {}) }, missing };
}

/**
 * Compiles a source for the build. Without i18n: one manifest (a localized folder then
 * only compiles its default language). With i18n: one manifest per language, each with
 * '/<lang>'-prefixed links; a localized folder translates the default language's pages
 * (see mergeTranslation), any other folder serves the same pages to every language.
 * Returns { manifests: { [lang | '']: manifest }, warnings }.
 */
export function compileLanguages(source, context, { i18n, languages, defaultLanguage }) {
  const localized = isLocalized(source, defaultLanguage);
  const warnings = [];
  const keep = (result, report) => {
    if (report) warnings.push(...result.warnings);
    return result;
  };

  if (!i18n) {
    const result = keep(compileSource(localized ? languageSource(source, defaultLanguage) : source, context), true);
    return { manifests: { '': result.manifest }, warnings };
  }

  const manifests = {};
  for (const lang of languages) {
    const langContext = { ...context, linkPrefix: `/${lang}` };
    // The same content is compiled once per language: only the link prefix differs, so its
    // warnings are reported once.
    const base = keep(compileSource(localized ? languageSource(source, defaultLanguage) : source, langContext), lang === languages[0]);

    if (!localized || lang === defaultLanguage) {
      manifests[lang] = base.manifest;
      continue;
    }

    const langDir = path.join(source.dir, lang);
    if (!isDirectory(langDir)) {
      manifests[lang] = mergeTranslation(base.manifest, { sections: [], pages: {} }, { source, lang, defaultLanguage }).manifest;
      warnings.push(`"${source.folder}" has no "${lang}" folder — every page shows its "${defaultLanguage}" version`);
      continue;
    }

    const defaultDir = path.join(source.dir, defaultLanguage);
    const fallbackHref = (resolved) => base.hrefBySource.get(path.join(defaultDir, path.relative(langDir, resolved)));
    const own = keep(compileSource(languageSource(source, lang), { ...langContext, fallbackHref }), true);
    const { manifest, missing } = mergeTranslation(base.manifest, own.manifest, { source, lang, defaultLanguage });
    if (missing.length) {
      warnings.push(`"${source.folder}/${lang}" has no translation for: ${missing.join(', ')} — showing their "${defaultLanguage}" version`);
    }
    manifests[lang] = manifest;
  }

  return { manifests, warnings };
}

