# Switching package manager

Switching package manager in an existing Nutin app requires adapting:

- **breaking**: `packageManager` in `.nutin-meta.json` (used by `nutin-update` and `nutin-add`)
- **breaking**: `package.json` scripts (`serve`, `serve:prod`, `testin-nutin`, `testin-nutin:watch`, `testin-nutin:coverage`, `testin-nutin:verbose`)
- **breaking**: `tools/dev/dev-serve.js`
- **breaking**: `tools/dev/watcher.js`
- **breaking**: `tools/testin-nutin/watch-tests.js`
- *cosmetic*: `tools/generator/generator.js`, `tools/builder/builder.js`, `tools/utils/build-lock.js` and `nutin.config.js` (messages and comments)
- **breaking** *(if Docker feature is already added)*: `tools/docker/Dockerfile.template` 
