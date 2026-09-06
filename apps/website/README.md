# [nutin website](https://www.nutin.org)

- [Docs](#docs)
- [Helpers](#helpers)

## Docs

Monorepo's `docs` folder represents the single documentation source (*Exceptions*: `packages/nutin/CHANGELOG.md` - is part of the `nutin` package, `packages/nutin/templates/base/GETTING_STARTED.md.hbs` - base documentation present in every generated app). 

Website docs pages are therefore generated from `docs/` markdown files, using `marked` dependency with a custom build step (`scripts/generate-docs.mjs`, `apps/website/tools/builder/core/docs/generate-docs.js`).

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

### Format code to JSON (ts, html, scss)

- Usage : `npm run code-to-json -- SOURCE_FILE --output DEST_FILE`
Translates newlines to `\n` and tabs to `\t`. Also escapes double quotes `"` and translates `<` and `>` to `&lt;` and `&gt;`.                                                                  
*Requires some manual copy / pasting, but is good enough for such a project.*
