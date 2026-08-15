# [nutin](https://www.nutin.org)

**nutin aims to bridge the gap between vanilla web development and large frameworks.**

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
# argument: project-name (will prompt if not provided)

# Help
-h --help

# Package manager
-pm --package-manager <manager> # npm (Default), yarn, pnpm, bun

# Features - can also be added on an existing app with `nutin-add <feature>`
--libs # Built-in libraries (forms, overlays, accessibility components)
--docker # Dockerfile & nginx.conf

# Presets
--preset <|default|full|> 
	# default: only Nutin. Used if no --preset arg is provided
	# full: built-in libraries + docker
```

## [First app tutorial](https://www.nutin.org/tutorial)

## 📄 Docs

- Docs on [website](https://www.nutin.org).
- Docs on [repository](https://github.com/LoisKOUNINEF/nutin/tree/main/docs).
