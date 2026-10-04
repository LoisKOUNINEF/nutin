import { markdownLanguage } from './markdown-i18n.js';

export interface IMarkdownHeading {
  depth: number;
  text: string;
  id: string;
}

export interface IMarkdownPage {
  slug: string;
  title: string;
  description: string;
  section: string;
  group: string | null;
  order: number;
  source: string;
  headings: IMarkdownHeading[];
  html: string;
  ogImage?: string;
  // With i18n: no translation exists, this is the default language's page.
  fallback?: boolean;
}

export interface IMarkdownGroup {
  id: string | null;
  title: string | null;
  pages: string[];
}

export interface IMarkdownSection {
  id: string;
  title: string;
  description: string;
  groups?: IMarkdownGroup[];
  pages?: string[];
}

// Compiled from a folder's "landing" option: the index shown on its bare route.
export interface IMarkdownLanding {
  title: string;
  description: string;
}

export interface IMarkdownSource {
  id: string;
  sectionInPath: boolean;
}

interface IMarkdownManifestData {
  sections: IMarkdownSection[];
  pages: Record<string, IMarkdownPage>;
  landing?: IMarkdownLanding;
}

const EMPTY_MANIFEST: IMarkdownManifestData = { sections: [], pages: {} };

// One compiled "markdownSources" folder (/generated/<id>.json, written at build time by
// tools/builder/core/markdown — or /generated/<id>.<lang>.json per language with i18n, where
// every getter reads the current language's data). Instances are owned by MarkdownManifestsService.
export class MarkdownManifest {
  public readonly id: string;
  public readonly sectionInPath: boolean;
  private readonly getLanguage: () => string | null;
  private readonly _data = new Map<string, IMarkdownManifestData>();
  private readonly _loading = new Map<string, Promise<void>>();
  private readonly _failed = new Set<string>();

  // getLanguage: the current language, or null without i18n (overridable for tests).
  constructor({ id, sectionInPath }: IMarkdownSource, getLanguage: () => string | null = markdownLanguage) {
    this.id = id;
    this.sectionInPath = sectionInPath;
    this.getLanguage = getLanguage;
  }

  private get lang(): string {
    return this.getLanguage() ?? '';
  }

  private urlFor(lang: string): string {
    return lang ? `/generated/${this.id}.${lang}.json` : `/generated/${this.id}.json`;
  }

  public get url(): string {
    return this.urlFor(this.lang);
  }

  public get loaded(): boolean {
    return this._data.has(this.lang);
  }

  // True when the last load for the current language failed: the manifest is empty because of
  // an error, not because the folder has no pages.
  public get loadFailed(): boolean {
    return this._failed.has(this.lang);
  }

  // Fetched once per language. A failed load keeps it empty, sets loadFailed, and is retried on the next call.
  public load(): Promise<void> {
    const lang = this.lang;
    let loading = this._loading.get(lang);
    if (!loading) {
      loading = this.fetchManifest(lang);
      this._loading.set(lang, loading);
    }
    return loading;
  }

  private async fetchManifest(lang: string): Promise<void> {
    const url = this.urlFor(lang);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this._data.set(lang, await response.json());
      this._failed.delete(lang);
    } catch (error) {
      this._loading.delete(lang);
      this._failed.add(lang);
      console.error(`Markdown manifest load error (${url}):`, error);
    }
  }

  private get data(): IMarkdownManifestData {
    return this._data.get(this.lang) ?? EMPTY_MANIFEST;
  }

  // Set when the folder has a "landing": its bare route shows an index instead of the first page.
  public get landing(): IMarkdownLanding | undefined {
    return this.data.landing;
  }

  public get sections(): IMarkdownSection[] {
    return this.data.sections;
  }

  public getPage(slug: string): IMarkdownPage | undefined {
    return this.data.pages[slug];
  }

  public getSection(id: string): IMarkdownSection | undefined {
    return this.data.sections.find((section) => section.id === id);
  }

  public get firstSlug(): string | undefined {
    return this.firstSlugOf(this.data.sections[0]);
  }

  public firstSlugOf(section: IMarkdownSection | undefined): string | undefined {
    const pages = section?.groups?.[0]?.pages ?? section?.pages;
    return pages?.[0];
  }

  public get hasPages(): boolean {
    return this.data.sections.some((section) =>
      section.groups ? section.groups.some((group) => group.pages.length > 0) : (section.pages?.length ?? 0) > 0
    );
  }
}
