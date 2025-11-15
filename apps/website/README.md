# [nutin website](https://www.nutin.org)

- [Components](components-1)
- [Views](views-1)
- [Helpers](helpers-1)

## Components

### Section

```typescript
interface ISection {
  id: number;
  name: string;
  content?: string;
  snippets: ISnippet[];
  notes?: string;
}

type LocalizedSection = {
  id: number;
} & Record<Exclude<number, 'id'>, ISection>;

interface ISectionConfig {
  section: ISection;
  // catalogTocHref is used in SinglePageCatalogView
  catalogTocHref?: string;
}
```

Takes an argument `ISectionConfig`.                    
Handles section name, content, and notes.                     
Children : section's snippets (as a catalog) and an AnchorComponent (for SinglePageCatalogView).

### Snippet

```typescript
interface ISnippet {
  id: number;
  sectionId: number;
  content: string;
  type: string;
  before?: string;
  after?: string;
}

type LocalizedSnippet = {
  [K in keyof ISnippet as K extends OptionalKeys<ISnippet> ? never : K]: ISnippet[K];
} & Record<string, Partial<Pick<ISnippet, OptionalKeys<ISnippet>>>>;

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T];
```

Takes an ISnippet argument, handles snippet's content, before and after. Snippet's language class is applied dynamically for prismJs to use.

### Sidebar

```typescript
interface ISidebarConfig {
  sections: ISection[];
  viewName: string;
}
```
Takes an ISidebarConfig argument. Used for navigation (with viewName property) in TopicParamView.                                  
Adds a padding-left if section's id contains a dot (e.g. 1.2).

### TableOfContent

Used in SinglePageCatalogView to scroll to a section's anchor. Takes an ISection array argument.

## Views (abstract classes)

### ResourceView

Applies PrismJS highlighting (helper).

- Abstract (protected) properties :
```typescript
sections: ISection[];
sectionsIndexSelector: string;
sectionComponentSelector: string;
```
Abstract properties are implemented in concrete classes derived from SinglePageCatalogView & TopicParamView.

### SinglePageCatalogView

tocHref property is used for the 'back to table of content' anchor at the end of each section.                    
Renders a table of content with sections' ids and names on top, and every sections' content below.

### TopicParamView

Renders a left sidebar with sections' ids and names.                        
Displays the selected section on the right, using View class getRouteParam method.

## Helpers

### Prism

Used in ResourceView to apply Prism highlighting.                      
Folder also contains the prism.js code to highlight Javascript, TypeScript, SASS and HTML.

### BuildSection

```typescript
buildSection(
    localizedSection: LocalizedSection,
    localizedSnippets: LocalizedSnippet[]
  ): ISection

// build multiple sections
buildSectionBatch(
    localizedSections: ILocalizedSectionWithSnippets[]
  ): ISection[]
type ILocalizedSectionWithSnippets = {
  section: LocalizedSection,
  snippets: LocalizedSnippet[]
}
```

### Sort

- sort-by-id : Sorts an array of objects by the 'id' property (number) from lowest to highest.

### Normalize string

Used in TopicParamView to ensure that the URL has the correct format when rendering a specific section.

### Translate code (ts, html, scss) to JSON format

- Usage : `npm run code-to-json -- SOURCE_FILE --output DEST_FILE`
Translates newlines and tabs to JSON format.                      
When SOURCE_FILE has the .html extension, also translates `<` and `>` to `&lt;` and `&gt;`.                                                                  
*It requires some manual copy / pasting, but should be sufficient for such a small project.*