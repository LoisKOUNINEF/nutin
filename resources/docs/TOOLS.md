---
title: Tools
---

# Nutin - Tools documentation

## Table of Contents

- [Development environment](./TOOLS/DEVELOPMENT_ENVIRONMENT.md)
- [Generator](./TOOLS/GENERATOR.md)
- [Builder](./TOOLS/BUILDER.md)
- [Updater](./TOOLS/UPDATER.md)
- [Upgrading from 2.x to 3.0](./TOOLS/UPGRADING_TO_V3.md)

***IMPORTANT NOTE:*** 

Switching package manager in an existing Nutin app requires adapting: 

- **breaking**: `tools/dev/dev-serve.js`
- **breaking**: `tools/dev/watcher.js`
- *cosmetic*: `tools/generator/generator.js` and `tools/builder/builder.js`
- **breaking** *(if Docker feature is already added)*: `tools/docker/Dockerfile.template` 
