---
ogImage: /assets/images/og-covers/og-cover-articles.jpg
---

# Why Nutin?

## A powerful platform

The web platform already provides powerful primitives for building web applications.

What it doesn't provide is an architecture for organizing an application as it grows.

## Nutin's concepts

Nutin provides a small set of explicit concepts, each with a clear responsibility:

* Views **orchestrate application flow**
* Components **encapsulate UI behavior** with explicit lifecycle methods
* Services **handle application concerns** through shared instances
* Events **connect them** through type-checked contracts

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

* want application structure with a thin, explicit rendering model;
* want to work mostly with the DOM and browser APIs;
* want framework code and abstractions to remain visible and editable;
* prefer a small set of explicit concepts over a larger framework ecosystem.

This can include internal tools, dashboards, CRUD applications, documentation and content sites, and other small-to-medium applications. Without the router, Nutin can also be a guest on someone else's page (a widget, a browser extension's popup...).

## When not to use Nutin?

Nutin is not a good fit if:

* your project depends heavily on a mature ecosystem of framework-specific libraries or UI components;
* your team benefits from the conventions and tooling of an established framework ecosystem;
* much of your UI depends on fine-grained state that changes often: Nutin has no reactive state and no DOM diffing;
* you need routing inside an embedded widget.

## More about Nutin

### Behind Nutin

If you're interested in how Nutin evolved and the thinking behind its design, read [The Story Behind Nutin](https://nutin.org/articles/the-story-behind-nutin).

### FAQ

See the [FAQ](https://nutin.org/articles/faq).
