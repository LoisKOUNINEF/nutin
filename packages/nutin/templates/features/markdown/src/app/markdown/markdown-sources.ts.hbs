import { IMarkdownSource } from './markdown-manifest.js';

export type MarkdownSourceEntry = string | {
  folder: string;
  routePrefix?: string;
  hubFiles?: string[];
  sectionInPath?: boolean;
  prefixReplacements?: [string, string][];
  seo?: boolean;
  ogImage?: string;
  landing?: boolean | { title?: string; description?: string };
};

declare global {
  // Set by the builder's esbuild define (tools/builder/core/prod-bundle/bundle-options.js):
  // nutin.config.js's markdownSources.sourceFolders, as JSON. Undefined in tsc output (tests).
  var __NUTIN_MARKDOWN_SOURCES__: string | undefined;
}

export interface IMarkdownSourcesConfig {
  sourceFolders?: MarkdownSourceEntry[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Mirrors normalizeSource() in tools/builder/core/markdown/markdown-compiler.js, which names
// each manifest: keep both id rules identical (the build validates entries, not this).
export function resolveMarkdownSources(config: IMarkdownSourcesConfig | undefined): IMarkdownSource[] {
  return (config?.sourceFolders ?? []).map((entry) => {
    const options = typeof entry === 'string' ? { folder: entry } : entry;
    const folderName = options.folder.replace(/[\\/]+$/, '').split(/[\\/]/).pop() ?? '';
    return {
      id: options.routePrefix ?? slugify(folderName),
      sectionInPath: options.sectionInPath === true,
    };
  });
}
