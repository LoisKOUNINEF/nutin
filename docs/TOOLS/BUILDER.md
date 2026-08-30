# Builder

## Usage 

```bash
# Build application
<pm> run build

# Build application for production
<pm> run build:prod
```

## Steps

### Setup

- Copy files in temporary `dist-build` directory

### Base steps

- Add tags to `index.html` (script, stylesheet) and validate it.
- Validate application routes - fail if duplicates are found
- Compile TypeScript (`--silent` in production, type-checking only)
- Merge / minify HTML templates
- Compile styles *(including Tailwind CSS with `tailwind` option enabled)*
- *with i18n option enabled:* Merge locales into a single `.json` file

### Production-only steps

- Run esbuild
- Hash files
- Compress files in Gzip (`.gz`) and Brotli (`.br`) formats
- *with generateSEOFiles option enabled:* Generate static `.html` files for routes configured in `config/seo.json`
- Remove unused folders and `nutin.config.js`.

### Final step

- Rename `dist-build` to `dist`

## Notes

- You can configure SASS paths to be compiled in `nutin.config.js`.
- You can configure ESBuild options in `nutin.config.js`.
- If you need new asset formats to be included in the built output, add them in `tools/builder/app/binary-extensions.js`.
