# Contributing to nutin

Thank you for your interest in contributing! This document provides guidelines and information for contributing to this monorepo, which contains the npm package and the official website.

## Table of Contents

- [Philosophy and Principles](#philosophy-and-principles)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Getting Help](#getting-help)
- [Recognition](#recognition)
- [License](#license)

## Philosophy and Principles

```java
nutin aims to bridge the gap between vanilla web development and large frameworks.
```

The goal is to provide a structured layer:

* explicit, easy to understand and to start with;
* favoring code ownership and openness;
* with a very high test coverage and (pretty) well-documented

The internal architecture should remain highly modular, while the public APIs and CLI should remain intentionally small.

### Expose concepts, not implementation

The CLI and generated project should expose concepts that users naturally understand.

A user should think in terms of **capabilities**, not source folders; the CLI represents the user's mental model, not the filesystem.

Example:
```bash
# Internal structure:
libs/
    components/
    forms/
    overlays/
    pipes/

# Public CLI:
nutin add libs
```

### Internal modularity

Internal code should be split aggressively.

Reasons:

* Single Responsibility Principle
* Easier maintenance
* Maximum flexibility with minimal user complexity.

EXAMPLE:

```node
// Exposed:
installLibs()

// may internally perform:
installComponents();
installForms();
installOverlays();
installPipes();
```

### Configuration philosophy

The project has one configuration entry point (single source of truth) that contains framework-wide configuration.

```
nutin.config.js

Nutin features - i18n, inlineTemplates, tailwind booleans

# sections
builder
generator
testing
...
```

### Simplicity beats configurability

Adding options is easy.

Removing them later can only be done manually.

### Framework defaults

Defaults exist to eliminate unnecessary decisions.

Users can always pick options or deviate later.

### Design heuristics

When introducing a new feature, ask:

1. Is this architecture or productivity?
2. Will most projects eventually use it?
3. Does this improve or worsen the user experience?
4. Can the implementation remain modular while the public API stays simple?
5. Am I exposing a capability, or leaking an implementation detail?

If unsure, choose the simpler public API.

Internal architecture should preserve future flexibility.

The framework should evolve internally without forcing users to learn new concepts unless those concepts provide clear, tangible value.

## Getting Started

### Prerequisites

- Node.js: Version 22.x or higher
- npm: Version 9.x or higher (or yarn/pnpm/bun equivalent)
- Git: Latest stable version

## Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/lois-kouninef/nutin.git
   cd nutin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Contributing Guidelines

### Types of Contributions

Various types of contributions are welcome:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📝 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- 🔧 **Build and tooling improvements**
- 🧪 **Test coverage improvements**
- 🌍 **Translations**

### Before You Start

1. **Check existing issues** to see if your contribution is already being discussed
2. **Open an issue** for significant changes to discuss your approach
3. **Search existing PRs** to avoid duplicate work

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make your changes:**
   - Follow the existing code style and conventions
   - Update documentation as needed
   - Add tests for new functionality **NOTE**: Nutin is tested with its own toolkit, syntax is very Jest-inspired.

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "type(scope): description"
   ```

### Commit Message Convention

We use [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Scopes:**
- `core`: Changes to the main toolkit
- `testing`: Changes to the testing toolkit
- `libraries`: Changes to the built-in libraries
- `website`: Changes to the website
- `docs`: Documentation changes
- `ci`: CI/CD changes

**Examples:**
- `feat(nutin): implemented dependency injection`
- `fix(website): resolve mobile navigation issue`
- `docs: added docs for X`

## Pull Request Process

### PR Template

When creating a PR, please include:

1. **Description** of changes
2. **Type of change** (bug fix, new feature, etc.)
3. **Testing** performed
4. **Screenshots** (for UI changes)
5. **Breaking changes** (if any)
6. **Related issues** (if applicable)

## Documentation

### Package / Website Documentation

- **Documentation**: Generated from JSDoc comments
- **README**: Keep READMEs up to date
- **Examples**: Include practical usage examples

### Writing Guidelines

- Use clear, concise language
- Include code examples where helpful
- Keep documentation up to date with code changes
- Use proper markdown formatting.

## Getting Help

### Community

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Discord**: [Coming soon(er or later)]

### Maintainer Contact

For sensitive issues or direct maintainer contact:
- Email: [nutin-toolkit@gmail.com]

## Recognition

- **All Contributors**: Listed in README
- **Release notes**: Contributions mentioned in changelogs
- **Gratitude**

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.


Thank you for contributing! 🎉