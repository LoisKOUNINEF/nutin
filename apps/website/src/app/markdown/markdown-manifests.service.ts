import nutinConfig from '../../../nutin.config.js';
import { Service } from '../../core/index.js';
import { MarkdownManifest } from './markdown-manifest.js';
import { IMarkdownSourcesConfig, MarkdownSourceEntry, resolveMarkdownSources } from './markdown-sources.js';

// Every folder listed in nutin.config.js "markdownSources", by id (its routePrefix,
// defaulting to the folder name). Manifests load on demand: MarkdownGuards load theirs
// before a page renders; call loadAll() at startup to have them all available upfront.
export class MarkdownManifests extends Service<MarkdownManifests> {
  private readonly manifests = new Map<string, MarkdownManifest>();

  constructor() {
    super();
    // Bundled builds get the folders from the builder's define (nutin.config.js's
    // markdownSources isn't bundled); test runs on tsc output read the config itself.
    // Used directly in `??` so esbuild folds the fallback away.
    const sourceFolders: MarkdownSourceEntry[] = JSON.parse(globalThis.__NUTIN_MARKDOWN_SOURCES__
      ?? JSON.stringify((nutinConfig.markdownSources as IMarkdownSourcesConfig | undefined)?.sourceFolders ?? []));
    for (const source of resolveMarkdownSources({ sourceFolders })) {
      this.manifests.set(source.id, new MarkdownManifest(source));
    }
  }

  public get ids(): string[] {
    return [...this.manifests.keys()];
  }

  public get all(): MarkdownManifest[] {
    return [...this.manifests.values()];
  }

  public get(id: string): MarkdownManifest {
    const manifest = this.manifests.get(id);
    if (!manifest) {
      throw new Error(`Unknown Markdown source "${id}" — known: ${this.ids.join(', ') || 'none'} (nutin.config.js "markdownSources")`);
    }
    return manifest;
  }

  public async load(id: string): Promise<MarkdownManifest> {
    const manifest = this.get(id);
    await manifest.load();
    return manifest;
  }

  public async loadAll(): Promise<void> {
    await Promise.all(this.all.map((manifest) => manifest.load()));
  }
}

export const MarkdownManifestsService = /* @__PURE__ */ MarkdownManifests.getInstance();
