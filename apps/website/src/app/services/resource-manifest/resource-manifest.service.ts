import { Service } from '../../../core/index.js';

export interface IResourceHeading {
  depth: number;
  text: string;
  id: string;
}

export interface IResourcePage {
  slug: string;
  title: string;
  description: string;
  section: string;
  group: string | null;
  order: number;
  source: string;
  headings: IResourceHeading[];
  html: string;
}

export interface IResourceGroup {
  id: string;
  title: string;
  pages: string[];
}

export interface IResourceSection {
  id: string;
  title: string;
  description: string;
  groups?: IResourceGroup[];
  pages?: string[];
}

interface IResourceData {
  sections: IResourceSection[];
  pages: Record<string, IResourcePage>;
}

const EMPTY_MANIFEST: IResourceData = { sections: [], pages: {} };

// Base for the build-time-compiled Markdown resources (docs/changelog/tutorial/
// articles — see scripts/generate-docs.mjs). Each resource gets its own thin
// subclass below rather than one shared instance, because a single class instantiated with 4
// different manifest URLs would collide on the same key.
export abstract class ResourceManifest<T extends ResourceManifest<T>> extends Service<T> {
  private _manifest: IResourceData = EMPTY_MANIFEST;
  private readonly _manifestUrl: string;

  constructor(manifestUrl: string) {
    super();
    this._manifestUrl = manifestUrl;
  }

  public async load(): Promise<void> {
    try {
      const response = await fetch(this._manifestUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._manifest = await response.json();
    } catch (error) {
      console.error(`Resource manifest load error (${this._manifestUrl}):`, error);
    }
  }

  public get sections(): IResourceSection[] {
    return this._manifest.sections;
  }

  public getPage(slug: string): IResourcePage | undefined {
    return this._manifest.pages[slug];
  }

  public get firstSlug(): string | undefined {
    const firstSection = this._manifest.sections[0];
    const pages = firstSection?.groups?.[0]?.pages ?? firstSection?.pages;
    return pages?.[0];
  }

  public get hasPages(): boolean {
    return this._manifest.sections.some((section) =>
      section.groups ? section.groups.some((group) => group.pages.length > 0) : (section.pages?.length ?? 0) > 0
    );
  }
}
