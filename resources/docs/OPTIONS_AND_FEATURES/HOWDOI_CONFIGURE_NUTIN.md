# How do I configure Nutin?

## Central configuration file

**`nutin.config.js`** - See inline comments in the actual file for details

- `i18n`, `tailwind`, `generateSEO` — top-level option toggles.
- `builder.{sass.paths, esbuild}` — build pipeline behavior.
- `testinNutin.{includeFramework, includeTools, includeApp, coverage, jsdomOptions}` — built-in testing toolkit.
- `dockerPorts`, `markdownSources` - Nutin features configuration (*only when related feature is present*). See [How do I use the Docker feature?](HOWDOI_USE_DOCKER_FEATURE.md) and [How do I use the Markdown feature?](HOWDOI_USE_MARKDOWN_FEATURE.md)

## Specialized configuration files

- `config/languages.json`: Configure supported languages and default language. *See [How do I use i18n](HOWDOI_USE_I18N.md)*
- `config/seo.json`: Configure route paths to generate SEO files. *See [How do I use SEO files generation](HOWDOI_USE_SEO_FILE_GENERATION.md)*
