---
ogImage: /assets/images/og-covers/og-cover-articles.jpg
---

# Why Nutin?

## An already powerful platform

The web platform already provides powerful primitives for building web applications.

What it doesn't provide is an application architecture.

Nutin provides that structure without replacing the platform underneath it, and without runtime dependencies.

## Structure without replacing the platform

Nutin is a lightweight frontend framework for building structured web applications with standard HTML, CSS, and TypeScript or JavaScript, using the browser's native APIs at its core.

Nutin doesn't try to replace the web platform with its own abstractions; it gives a structured way to use native APIs. Its abstractions are boundaries around platform capabilities, rather than replacements for them.

Nutin adds structure where an application benefits from it, while leaving the underlying platform visible and accessible.

## Nutin's concepts

Nutin provides a small set of explicit concepts, each with a clear responsibility:

* Views **orchestrate application flow**
* Components **encapsulate UI behavior**
* Services **handle application concerns**
* Events **connect them without coupling them**

## What Nutin adds

* **[Runtime](https://nutin.org/docs/api)**: a router (guards, lazy routes), pipes, an HTTP client and an HTML tagged template that escapes interpolated values.
* **[Tooling](https://nutin.org/docs/tools)**: a generator, a dev server with live reload, and a builder (code splitting, minification, compression).
* **[Options](https://nutin.org/docs/options-and-features)**: Tailwind CSS, i18n and SEO file generation.
* **[Features](https://nutin.org/docs/options-and-features)**: Docker and Markdown.

## Your application owns Nutin

**The framework should remain subordinate to the application**.

Rather than treating the framework as an opaque dependency, Nutin's framework code lives alongside your application, with its own tests.

When an update modifies a file you've changed, Nutin merges the changes and leaves only conflicting edits for you to resolve. See [Updater](https://nutin.org/docs/tools/updater).

Your application owns its architecture. Nutin provides structure within it.

## When to use Nutin?

Nutin is a good fit when you:

* want application structure without adopting a separate rendering model;
* want to work directly with the DOM and browser APIs;
* want framework code and abstractions to remain visible and editable;
* prefer a small set of explicit concepts over a larger framework ecosystem.

This can include internal tools, dashboards, CRUD applications, documentation and content sites, browser extensions, embedded interfaces, and other small-to-medium applications.

## When not to use Nutin?

Nutin is not a good fit if:

* server-side rendering, hydration, or other framework-specific rendering strategies are central requirements;
* your project depends heavily on a mature ecosystem of framework-specific libraries or UI components;
* your team benefits from the conventions and tooling of an established framework ecosystem.

## More about Nutin

### Behind Nutin

If you're interested in how Nutin evolved and the thinking behind its design, read [The Story Behind Nutin](https://nutin.org/articles/the-story-behind-nutin).

### FAQ

See the [FAQ](https://nutin.org/articles/faq).
