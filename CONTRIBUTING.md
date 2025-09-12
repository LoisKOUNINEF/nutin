# Contributing to nutin

Thank you for your interest in contributing! This document provides guidelines and information for contributing to this monorepo, which contains the npm package, the official website and the tutorial app.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Getting Help](#getting-help)
- [Recognition](#recognition)
- [License](#license)

## Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (or yarn/pnpm equivalent)
- **Git**: Latest stable version

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

We welcome various types of contributions:

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
   - Add tests for new functionality
   - Ensure all tests pass

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
- `nutin`: Changes to the main toolkit
- `testin-nutin`: Changes to the tesing toolkit
- `stylin-nutin`: Changes to the styling library
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

Contributors are recognized in several ways:

- **All Contributors**: Listed in README
- **Release notes**: Contributions mentioned in changelogs
- **GitHub**: Contributor badges and statistics

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.


Thank you for contributing! 🎉