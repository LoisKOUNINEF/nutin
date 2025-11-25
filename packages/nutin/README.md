# [nutin](https://www.nutin.org)

**Build SPAs by understanding SPAs. A minimal frontend toolkit crafted for learning and lean applications.**                    
Includes essential features out of the box.                          
*Pure TypeScript, SASS, and DOM-driven components — zero runtime dependencies.*

- Required : Node >=18 
- **JSDOM requirement** (testin-nutin companion) : `{ node: '^20.19.0 || ^22.12.0 || >=24.0.0' }`

## Install

```bash
# install package globally
npm install -g @nutin/cli
```

## New App

```bash
# create a new app
create-nutin-app # or
nutin-new

# without global installation
npx @nutin/cli
```

- Flags

```bash
# argument: project-name (prompt if not provided)

# Help
-h --help

# Defaults settings - see below
-d --defaults

# Package manager
-pm --package-manager <manager> # npm (Default), yarn, pnpm, bun

# Features
--template # (Default) Use external templates
--no-template # Use inline templates
--stylin-nutin # (Default) Use built-in SCSS utility classes & mixins
--no-stylin-nutin # Do not use built-in SCSS utility
--testin-nutin # Use testin-nutin toolkit
--no-testin-nutin # (Default) Do not use testin-nutin toolkit
--i18n # (Default) Use i18n & json-based content
--no-i18n # Do not use i18n & json-based content
--deploy-helper # Use Docker & deployment helpers
--no-deploy-helper, # (Default) Do not use Docker & deployment helpers
--transition # Use animated view transitions. Note: May interfere with CSS `position: fixed`, `z-index`...
--no-transition # (Default) Do not use animated view transitions
```

## [First app tutorial](https://www.nutin.org/tutorial)

## 📄 Docs

- Docs on [website](https://www.nutin.org).
- Docs on [repository](https://github.com/LoisKOUNINEF/nutin/tree/main/docs).
