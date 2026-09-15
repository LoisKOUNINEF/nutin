# Roadmap

## Stable child identity and reuse

Nutin will preserve child components across parent re-renders when their identity has not changed.

Today, a parent re-render destroys and recreates its tracked children, which can unnecessarily discard DOM state such as focus, scroll position, and unsaved input.

The update will introduce stable child identity, including optional keys for components and `trackBy` support for catalogs. Unchanged catalog items will be reused rather than recreated, while changed items will continue to follow Nutin's existing destroy-and-recreate model.

This changes child lifecycle semantics: a child whose identity is preserved will no longer be destroyed and recreated unconditionally on every parent re-render.

Nutin will continue to render directly to the DOM. No virtual DOM or general-purpose DOM diffing will be introduced.

## JavaScript-only generated projects

Add a JavaScript option to Nutin's project generator alongside the existing TypeScript path.

JavaScript projects will provide the same core Nutin architecture. 

**Known trade-off:** TypeScript-specific compile-time guarantees, such as event name and payload checking, will not be available.

## SEO files generation

Improve SEO file generation with multiple fixes and stability improvements.

This includes making the generation process more reliable and addressing issues discovered through the Nutin website and documentation workflow.

## Markdown feature

Add an opt-in Markdown feature to Nutin for applications that need to manage Markdown content as part of their application.

The feature will provide a configurable way to turn Markdown files into application content, including metadata, ordering, navigation, and rendering.

It will be designed as an add-on rather than a core Nutin feature, keeping Markdown-related functionality out of applications that do not need it.

*SEO and SSR support for Markdown content will be addressed separately.*
