# [Nutin](https://www.nutin.org)

`The structure of a framework. The freedom of vanilla.`

Nutin provides the essential tools to build maintainable web applications that you own completely.

**Your app owns Nutin — not the other way around.** The framework source lives alongside your application, so you can read it, modify it, and make it yours. Nutin's update system is designed to preserve those changes.

Nutin is deliberately pragmatic, lightweight, and dependency-free on runtime.

## Install

```bash
# install package globally
npm install -g @nutin/cli
```

## New App

```bash
# create a new app
nutin-new # or create-nutin-app

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

## Links

- [First app tutorial](https://www.nutin.org/tutorial).
- [Website](https://www.nutin.org).
- [Docs on repository](https://github.com/LoisKOUNINEF/nutin/tree/main/docs).
