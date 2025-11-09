# [nutin](https://www.nutin.org)

**A lightweight, highly tweakable frontend toolkit, crafted for building lean, dynamic single-page applications without the complexity of full-scale frameworks.**                    
Includes essential features out of the box, with zero runtime dependencies.                          
*TypeScript / Javascript, SASS, HTML*

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
-pm --package-manager <manager> # npm (default), yarn, pnpm

--template # Use external templates
--no-stylin-nutin # Do not use built-in SCSS utility
--testin-nutin # Use testin-nutin toolkit
--i18n # Use i18n & json-based content
--transition # Use animated view transitions. Note: May interfere with CSS `position: fixed`, `z-index`...

# Defaults
--no-template # (Default) Do not use external templates
--stylin-nutin # (Default) Use built-in SCSS utility classes & mixins
--no-i18n # (Default) Do not use i18n & json-based content
--no-transition # (Default) Do not use animated view transitions
--no-testin-nutin # (Default) Do not use testin-nutin toolkit

# Help
-h --help
```

## [First app tutorial](https://www.nutin.org/tutorial)


- Visit the [website](https://www.nutin.org)
- [Project repository](https://github.com/LoisKOUNINEF/nutin)
