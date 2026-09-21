# [nutin website](https://www.nutin.org)

- [Docs](#resources)
- [Helpers](#helpers)

## Docs

Monorepo's `resources` folder represents the single documentation source (*Exceptions*: `packages/nutin/CHANGELOG.md` - is part of the `nutin` package, `packages/nutin/templates/base/GETTING_STARTED.md.hbs` - base documentation present in every generated app). 

Website docs pages are therefore generated from `docs/` markdown files, using `marked` dependency with a custom build step (`scripts/generate-docs.mjs`, `apps/website/tools/builder/core/docs/generate-docs.js`).

## Helpers

### Prism

Used in ResourceView to apply Prism highlighting.                      
Folder also contains the prism.js code to highlight Javascript, TypeScript, SASS and HTML.
