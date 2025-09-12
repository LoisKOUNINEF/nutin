declare type CoreEventMap = {
  'navigate': string;
  'reload': string;
  'view-mount': string;
  'view-render': string;
  'view-unmount': string;
  'track-pageview': { page: string };

  // Add other events and their payload types here
};

declare type StoreEventMap = {[ K in `store:${string}` ]: any; };

// Merged event map
declare type EventMap = CoreEventMap & StoreEventMap;
declare type EventKey = keyof EventMap;

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
  before?: string;
  after?: string;
}

declare type LocalizedSnippet = {
  [K in keyof ISnippet as K extends OptionalKeys<ISnippet> ? never : K]: ISnippet[K];
} & Record<string, Partial<Pick<ISnippet, OptionalKeys<ISnippet>>>>;
