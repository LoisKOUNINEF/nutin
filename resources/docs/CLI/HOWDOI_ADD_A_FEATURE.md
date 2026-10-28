# How do I add a feature?

From the project's root:

```bash
nutin-add docker
nutin-add markdown
nutin-add all       # both
```

| Feature | Adds | Docs |
|---|---|---|
| `docker` | A Dockerfile and nginx config, and the `docker:build`/`docker:run` scripts | [How do I use the Docker feature?](../OPTIONS_AND_FEATURES/HOWDOI_USE_DOCKER_FEATURE.md) |
| `markdown` | Markdown folders compiled into routed pages, and the `markdown:check` script | [How do I use the Markdown feature?](../OPTIONS_AND_FEATURES/HOWDOI_USE_MARKDOWN_FEATURE.md) |

A feature can only be removed by hand once it's added. See [What is the difference between options and features?](../OPTIONS_AND_FEATURES/WHATIS_THE_DIFFERENCE_BETWEEN_OPTIONS_AND_FEATURES.md)

## What it does

1. **Adds the feature's files.** A file that already exists at the same path is kept, and listed as skipped.
2. **Adds its scripts to `package.json`.** A script you already have under the same name is kept.
3. **Adds its configuration to `nutin.config.js`**, under a `// Nutin features` comment: `dockerPorts` for docker, `markdownSources` for markdown. A key that's already there is kept.
4. **Updates the Nutin files that change with the feature** (e.g. `tools/builder/builder.js` gets the markdown build step). Your own edits to those files are kept. When a change can't be placed automatically, it's printed as a patch to apply by hand.
5. **Records the feature in `.nutin-meta.json`,** so `nutin-update` updates its files too. Adding a feature that's already there does nothing.

Commit before adding a feature: the changes are easy to review, and to undo.

## Dependencies

`nutin-add` doesn't install anything:

- docker needs no npm package. It needs Docker, to build and run the image.
- markdown needs `marked` and `gray-matter`. The first dev build asks to install them; pass `-- -y` to install them without asking (`npm run build -- -y`), e.g. in CI. Production builds never install anything: they fail with the command to run.

## Projects without `.nutin-meta.json`

Projects created before Nutin recorded it have no `.nutin-meta.json`. `nutin-add` then asks which Nutin version created the project and which features it has, and writes the file. That needs an interactive terminal.

## Browser extensions

`docker` and `markdown` can't be added to a project created with `--extension`: an extension has no server, and Markdown pages need the router, which extension pages don't use.
