# How do I configure Nutin?

## Central configuration file

**`nutin.config.js`** - See inline comments in the actual file for details

- `i18n`, `tailwind`, `generateSEO` — top-level option toggles.
- `generator.{generateStylesheet, generateLocales, generateTest}` — what the generator scaffolds alongside new elements.
- `builder.{sass.paths, esbuild}` — build pipeline behavior.
- `testinNutin.{includeFramework, includeTools, includeApp, jsdomOptions}` — built-in testing toolkit.

## Specialized configuration files

- `config/languages.json`: Configure supported languages and default language. *See [How do I use i18n](HOWDOI_USE_I18N.md)*
- `config/seo.json`: Configure route paths to generate SEO files. *See [How do I use SEO files generation](HOWDOI_USE_SEO_FILE_GENERATION.md)*
