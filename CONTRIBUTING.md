# Contributing to nutin

Nutin is maintained as a small, focused toolkit. Contributions should preserve its simplicity, keep the public API intentionally small, and avoid introducing unnecessary abstractions or configuration.

## Philosophy and Principles

Nutin's public surface should remain small while providing:

* explicit concepts that are easy to understand and get started with;
* strong code ownership and openness;
* high test coverage and thorough documentation.

### Expose concepts, not implementation

The features should expose concepts that users naturally understand.

A user should think in terms of **capabilities**, not implementation details.

### Internal modularity

Internal code should be split aggressively.

Reasons:

* Single Responsibility Principle
* Easier maintenance
* Maximum flexibility with minimal user complexity.

### Configuration philosophy

A Nutin-generated project has one main configuration entry point, `nutin.config.js`, for framework and tooling options.

Specialized configuration files are used where appropriate, such as `config/languages.json` and `config/seo.json`.

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
- Git: Latest stable version

## Development Setup

1. **Clone and install
```bash
git clone https://github.com/lois-kouninef/nutin.git
cd nutin
npm install
```

2. **Test the package locally**

When working on the Nutin package, you can test the local version against a separate project.

Create a scratch project and link the local package:
```bash
mkdir nutin-scratch
cd nutin-scratch
npm link ../path/to/nutin/packages/nutin
```
Nutin CLI commands will now use the locally linked package.

When finished, unlink it:
```bash
npm unlink ../path/to/nutin/packages/nutin
```

## Making Changes

Contributions are welcome across the toolkit, CLI, build tooling, tests, documentation, and website.

Before making a substantial change, consider opening an issue or discussion to explain the problem and proposed approach. This is especially useful for changes that affect the public API, generated project structure, or framework architecture.

## Code

* Follow the existing code structure and conventions.
* Keep responsibilities separated.
* Prefer simple solutions over additional abstraction.
* Avoid exposing internal implementation details through the public API.
* Keep generated projects and CLI behavior consistent with the documented Nutin experience.

## Tests

New functionality and bug fixes should include appropriate tests.

Nutin is tested with testin-nutin, its own lightweight testing toolkit with a Jest-inspired syntax.

When changing existing behavior, update the relevant tests rather than relying solely on manual verification.

## Documentation

Documentation should favor practical examples and clear explanations over exhaustive reference material.

Update documentation when a change affects:

* public APIs or CLI commands
* generated project structure
* configuration
* user-facing behavior
* installation or development workflows

Keep documentation concise and aligned with the actual behavior of the project.

### Commits

Nutin prefers [Conventional Commits](https://conventionalcommits.org/) format:

Use the following format:
```
type(scope): description
```

Examples:

* `feat(nutin): implemented dependency injection`
* `fix(website): resolve mobile navigation issue`
* `docs: added docs for X`

## Pull Requests

Pull requests should clearly explain:

* what was changed
* why the change was made
* how it was tested
* any breaking changes or changes to generated projects

For changes affecting the public API, CLI, configuration, or generated project structure, explain the user-facing impact explicitly.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing! 🎉