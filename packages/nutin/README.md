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

# Presets
--preset <minimal|standard|full|cicd>
	# minimal: external templates
	# standard: minimal + i18n & built-in SCSS classes
	# full: standard + deployment helpers & built-in testing toolkit
	# cicd: minimal + deployment helpers

# Features
--i18n # Use i18n & json-based content
--deploy-helper # Use Docker & deployment helpers
--testin-nutin # Use testin-nutin toolkit
--transition # Use animated view transitions. Note: May interfere with CSS `position: fixed`, `z-index`...
```

## [First app tutorial](https://www.nutin.org/tutorial)

## 📄 Docs

- Docs on [website](https://www.nutin.org).
- Docs on [repository](https://github.com/LoisKOUNINEF/nutin/tree/main/docs).
