# Nutin - Tools documentation

***IMPORTANT NOTE:*** 

Switching package manager in an existing nutin app requires adapting: 

- **breaking**: `tools/dev/dev-serve.js`
- **breaking**: `tools/dev/watcher.js`
- *cosmetic*: `tools/generator/generator.js` and `tools/builder/builder.js`
- **breaking**: `tools/docker/Dockerfile.template` *(with docker feature already added)*

## Table of Contents

- [Package.json scripts](#packagejson-scripts)
- [Generator](#generator)
- [Builder](#builder)

## Package.json scripts

* Development server :

```bash
# build (dev environment) and serve
<pm> run serve

# build (prod environment) and serve
<pm> run serve:prod

# without build (use existing 'dist' output)
<pm> run serve:only

# build (dev environment) and serve with live reload
<pm> run dev
```

* Build for production:

```bash
<pm> run build:prod
# runs: NODE_ENV=production node tools/builder/builder.js
```

* Generate a component, view or service:

```bash
<pm> run generate ELEMENT ELEMENT_NAME
```

* Run tests (testin-nutin toolkit, shipped in base — no feature flag needed):

```bash
<pm> run testin-nutin           # build, then run once
<pm> run testin-nutin:watch     # build once, then re-run on file changes
<pm> run testin-nutin:coverage  # run and outputs coverage. Fails if below threshold defined in nutin.config.js.testinNutin.coverage.threshold
<pm> run testin-nutin:verbose   # run and log each test suite and test as it runs
```

* Docker (with docker feature added - See [How do I use the Docker feature?](./OPTIONS_AND_FEATURES/HOWDOI_USE_DOCKER_FEATURE.md)):

```bash
<pm> run docker:build
<pm> run docker:run
```

`docker:build` first validates the top-level `dockerPorts` from `nutin.config.js` and regenerates `tools/docker/Dockerfile`/`nginx.conf` from their `.template` counterparts, then invokes `docker build`.

## Generator

* Usage: `<pm> run generate TYPE PATH/TO/NAME`).
* `type` is a string (`component` || `view` || `service`).
* `path` is a target path where files will be created; the script normalizes / extracts the last word to derive the `name`. Files will be created in `TYPE_FOLDER/PATH/TO/NAME/NAME.ts` or in `TYPE_FOLDER/NAME/NAME.ts` if only `name` was provided.

### Files generated

- `<type>/<name>/<name>.<type>.ts`
- `<type>/<name>/<name>.<type>.html` *(except for services)*
- *If `generator.generateLocales` is on* : `<type>/<name>/locales/*.json` *(except for services)*
- *If `generator.generateStylesheet` is on* : `<type>/<name>/<name>.<type>.scss` *(except for services)*
- *If `generator.generateTest` is on* : `<type>/<name>/<name>.<type>.test.js`

### Notes

- Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files.
- *If `generator.generateLocales` is on* : The generator also creates locale fragments. It relies on `LANGUAGES` from `config/languages.json` at your project root.

## Builder

- You can configure SASS paths to be compiled in `nutin.config.js`.
- You can configure ESBuild options in `nutin.config.js`.
- If you add new asset formats, update `tools/builder/app/binary-extensions.js`.
