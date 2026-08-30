declare interface AppEventMap {
    'popover-opened': {};
    'popover-close': {};
}

// Prism
declare interface Window {
  Prism: {
    highlightAll(): void;
    highlightAllUnder(container: HTMLElement | DocumentFragment): void;
  };
}

// Section object
declare interface ISection {
  id: number;
  name: string;
  content?: string;
  snippets: ISnippet[];
  notes?: string;
}

declare type LocalizedSection = {
  id: number;
} & Record<Exclude<number, 'id'>, ISection>;


// Snippet object
declare type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T];

declare interface ISnippet {
  id: number;
  sectionId: number;
  content: string;
  type: string;
  title?: string;
  before?: string;
  after?: string;
}

declare type LocalizedSnippet = {
  [K in keyof ISnippet as K extends OptionalKeys<ISnippet> ? never : K]: ISnippet[K];
} & Record<string, Partial<Pick<ISnippet, OptionalKeys<ISnippet>>>>;
