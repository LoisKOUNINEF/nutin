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
Usage: nutin-new [options] [projectName]

Arguments:
  projectName                       Name of the project

Options:
  -V, --version                     output the version number
  -pm, --package-manager <manager>  Specify package manager (npm, yarn, pnpm, bun)
  --preset <preset>                 Project preset configuration:
        • minimal        - external templates
        • standard       - minimal + i18n & small UI library
        • full           - standard + deployment helpers & built-in testing toolkit
  --options <options>               Comma-separated list of additional options:
        • i18n           - i18n & json-based content
        • libs           - small UI library
        • deploy-helper  - Docker & deployment helpers
        • testing        - built-in testing toolkit
  -h, --help                        display help for command
```

## [First app tutorial](https://www.nutin.org/tutorial)

## 📄 Docs

- Docs on [website](https://www.nutin.org).
- Docs on [repository](https://github.com/LoisKOUNINEF/nutin/tree/main/docs).

## Resources

- [Test page performance](https://pagespeed.web.dev)
- [Test security headers (nginx)](https://securityheaders.com/)
