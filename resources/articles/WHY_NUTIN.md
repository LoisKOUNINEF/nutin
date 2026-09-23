# Why Nutin?

## What is Nutin?

Nutin is a lightweight frontend framework for building structured web applications with standard HTML, CSS, and TypeScript or JavaScript.

It provides the structure you need as an application grows — components, views, routing, services, events, and a build system — while keeping the browser's native APIs at the center of your application.

Nutin doesn't try to replace the web platform with its own abstractions; it gives a structured way to use native APIs. 

**Your application owns the framework, not the other way around**: rather than treating the framework as an opaque dependency, Nutin lives alongside your application. Nutin's update system is designed to preserve the changes you made.

## What problems does Nutin solve?

| Criteria | The problem | How Nutin approaches it |
|----------|--------------------------|-------------------|
| **Vanilla JS vs. Application Structure** | The web platform gives you powerful primitives, but leaves application architecture largely up to you. As an application grows, responsibilities can become difficult to organize consistently. | Nutin provides a small set of explicit concepts — components, views, services, routes, and events — while keeping your application close to the platform. |
| **Structure without a large runtime** | Larger frameworks can introduce abstractions and runtime machinery that aren't necessary for every application. | Nutin builds on native HTML, DOM APIs, and browser events rather than replacing them with a separate rendering model. |
| **Framework ownership** | Framework upgrades can make the framework itself an increasingly important part of an application's architecture. | Nutin is designed so that the application's code and architecture remain visible and editable. |
| **Growing applications** | A project can start comfortably with vanilla JavaScript and reach a point where introducing structure becomes increasingly difficult. | Nutin provides structure without requiring an application to adopt a fundamentally different programming model. |

## When to use Nutin?

Nutin is a good fit when you:

- want explicit structure without adopting a large framework;
- want to work directly with the DOM and browser APIs;
- are comfortable bringing your own UI components and libraries when needed;
- want the framework's concepts and implementation to remain understandable and accessible.

This can include internal tools, dashboards, CRUD applications, browser extensions, embedded interfaces, and other small-to-medium applications where a larger framework would introduce more structure or machinery than the application needs.

## When not to use Nutin?

Nutin may not be the right fit if your project depends heavily on:

- a large ecosystem of framework-specific libraries or UI components;
- established conventions and tooling provided by a large framework;
- a team that benefits significantly from the established conventions, ecosystem, and developer pool of another framework;
- features or abstractions that Nutin deliberately leaves to the web platform or third-party libraries.

## Behind Nutin

If you're interested in how Nutin evolved and the thinking behind its design, read [The Story Behind Nutin](https://nutin.org/articles/the-story-behind-nutin).

