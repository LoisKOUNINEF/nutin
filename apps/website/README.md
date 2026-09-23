# [nutin website](https://www.nutin.org)

- [Docs](#resources)
- [Helpers](#helpers)

## Docs

Monorepo's `resources` folder represents the single documentation source (*Exceptions*: `packages/nutin/CHANGELOG.md` - is part of the `nutin` package, `packages/nutin/templates/base/GETTING_STARTED.md.hbs` - base documentation present in every generated app). 

Website resource pages are therefore generated from `resources/` markdown files, using `marked` dependency with a custom build step..

## Helpers

### Prism

Used in ResourceView to apply Prism highlighting.                      
Folder also contains the prism.js code to highlight Javascript, TypeScript, SASS, HTML, and Bash.
