import * as fs from 'fs';
import path from 'path';
import { print, ensureDeps, errorExit } from '../../../utils/index.js';
import { PATHS } from '../app/paths.js';
import { builderConfig } from '../../builder.config.js';
import nutinConfig from '../../../../nutin.config.js';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../../../utils/languages.js';
import { compileLanguages, normalizeSource, MarkdownCompileError } from './markdown-compiler.js';

// Compiles every `markdownSources.sourceFolders` entry of nutin.config.js into
// dist/generated/<routePrefix>.json — or, with i18n, <routePrefix>.<lang>.json per language —
// fetched at runtime by a MarkdownManifest.
// `--check` (the "markdown:check" script) compiles everything but writes nothing.

const isCheck = process.argv.includes('--check');

const sourceFolders = nutinConfig.markdownSources?.sourceFolders;
if (!Array.isArray(sourceFolders)) {
  errorExit('nutin.config.js "markdownSources.sourceFolders" must be an array.', 'markdown');
}

await ensureDeps({
  feature: 'Markdown (markdownSources)',
  deps: [
    { name: 'marked', version: '^18.0.14' },
    { name: 'gray-matter', version: '^4.0.3' },
  ],
  isProd: builderConfig.isProd,
  origin: 'markdown',
});

// Loaded only now: they may have just been installed.
const { Marked } = await import('marked');
const matter = (await import('gray-matter')).default;

const root = process.cwd();
const outputDir = path.join(PATHS.tempSource, 'generated');

try {
  const sources = sourceFolders.map((entry) => normalizeSource(entry, root));

  const seenIds = new Map();
  for (const source of sources) {
    if (seenIds.has(source.id)) {
      throw new MarkdownCompileError(`"${seenIds.get(source.id)}" and "${source.folder}" both compile to "${source.id}.json" — give one a different "routePrefix"`);
    }
    seenIds.set(source.id, source.folder);
  }

  const languageOptions = { i18n: Boolean(nutinConfig.i18n), languages: LANGUAGES, defaultLanguage: DEFAULT_LANGUAGE };

  for (const source of sources) {
    const { manifests, warnings } = compileLanguages(source, { Marked, matter, root }, languageOptions);
    warnings.forEach((warning) => print.warn(`markdown: ${warning}`));

    for (const [lang, manifest] of Object.entries(manifests)) {
      const fileName = lang ? `${source.id}.${lang}.json` : `${source.id}.json`;
      const pageCount = Object.keys(manifest.pages).length;
      if (isCheck) {
        print.info(`markdown: "${source.folder}"${lang ? ` (${lang})` : ''} OK (${pageCount} pages)`);
        continue;
      }

      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(manifest));
      print.gray(`markdown: ${pageCount} pages from "${source.folder}" -> /generated/${fileName}`);
    }
  }
} catch (err) {
  errorExit(err instanceof MarkdownCompileError ? err.message : err, 'markdown');
}
