# [nutin](https://www.nutin.org)

**Build SPAs by understanding SPAs. A minimal frontend toolkit crafted for learning and lean applications.**                    
Includes essential features out of the box, with zero runtime dependencies.                          
*TypeScript / Javascript, SASS, HTML*

- Required : Node >=18 **If using testin-nutin: Node >=20.19.0 (JSDOM requirement : `{ node: '^20.19.0 || ^22.12.0 || >=24.0.0' }`)**

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
```

- Flags

```bash
# argument: project-name

-d --defaults
-pm --package-manager <manager> # npm (Default), yarn, pnpm, bun

--no-template # Use inline templates
--no-stylin-nutin # Do not use built-in SCSS utility
--testin-nutin # Use testin-nutin toolkit
--no-i18n # Do not use i18n & json-based content
--transition # Use animated view transitions. Note: May interfere with CSS `position: fixed`, `z-index`...

# Defaults
--template # (Default) Use external templates
--stylin-nutin # (Default) Use built-in SCSS utility classes & mixins
--i18n # (Default) Use i18n & json-based content
--no-testin-nutin # (Default) Do not use testin-nutin toolkit
--no-transition # (Default) Do not use animated view transitions

# Help
-h --help
```

## [First app tutorial](https://www.nutin.org/tutorial)

- Visit the [website](https://www.nutin.org)
- [Project repository](https://github.com/LoisKOUNINEF/nutin)
