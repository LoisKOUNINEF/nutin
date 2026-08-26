# How do I configure Nutin?

## Central configuration file

**`nutin.config.js`**

- `i18n`, `tailwind`, `generateSEO` — top-level option toggles.
- `generator.{generateStylesheet, generateLocales, generateTest}` — what the generator scaffolds alongside new elements.
- `builder.{sass.paths, esbuild}` — build pipeline behavior.
- `testinNutin.{includeFramework, includeTools, includeApp, jsdomOptions}` — built-in testing toolkit.

## Specialized configuration files

- `languages.json`: requires i18n feature. Configure supported languages and default language.
- `seo.json`: requires generateSEOFiles feature. Configure paths to generate SEO files from.
