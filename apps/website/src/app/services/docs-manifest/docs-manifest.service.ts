import { Service } from '../../../core/index.js';

export interface IDocHeading {
  depth: number;
  text: string;
  id: string;
}

export interface IDocPage {
  slug: string;
  title: string;
  description: string;
  section: string;
  group: string | null;
  order: number;
  source: string;
  headings: IDocHeading[];
  html: string;
}

export interface IDocGroup {
  id: string;
  title: string;
  pages: string[];
}

export interface IDocSection {
  id: string;
  title: string;
  description: string;
  groups?: IDocGroup[];
  pages?: string[];
}

interface IDocsManifest {
  sections: IDocSection[];
  pages: Record<string, IDocPage>;
}

const EMPTY_MANIFEST: IDocsManifest = { sections: [], pages: {} };

export class DocsManifest extends Service<DocsManifest> {
  private _manifest: IDocsManifest = EMPTY_MANIFEST;

  constructor() {
    super();
  }

  public async load(): Promise<void> {
    try {
      const response = await fetch('/generated/docs.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._manifest = await response.json();
    } catch (error) {
      console.error('Docs manifest load error:', error);
    }
  }

  public get sections(): IDocSection[] {
    return this._manifest.sections;
  }

  public getPage(slug: string): IDocPage | undefined {
    return this._manifest.pages[slug];
  }

  public get firstSlug(): string | undefined {
    const firstSection = this._manifest.sections[0];
    const pages = firstSection?.groups?.[0]?.pages ?? firstSection?.pages;
    return pages?.[0];
  }
}

export const DocsManifestService = DocsManifest.getInstance();
