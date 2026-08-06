# Architecture & Design Principles

## Philosophy

```java
nutin aims to bridge the gap between vanilla web development and large frameworks.
```

The goal is to provide a structured layer:

* explicit, easy to understand and to start with;
* favoring code ownership and openness;
* (pretty) well-documented

The internal architecture should remain highly modular, while the public APIs and CLI should remain intentionally small.

## Expose concepts, not implementation

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

## Internal modularity

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

## Configuration philosophy

The project has one configuration entry point that contains framework-wide configuration.

```
nutin.config.js

# sections
builder
generator
testing
...
```

## Simplicity beats configurability

Adding options is easy.

Removing them later can only be done manually.

## Framework defaults

Defaults exist to eliminate unnecessary decisions.

Users can always pick options or deviate later.

## 42
