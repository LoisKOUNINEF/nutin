# Roadmap

## JavaScript-only generated projects

Add a JavaScript option to Nutin's project generator alongside the existing TypeScript path.

JavaScript projects will provide the same core Nutin architecture. 

**Trade-off:** TypeScript-specific compile-time guarantees, such as event name and payload checking, will not be available.

## Markdown feature

Add an opt-in Markdown feature to Nutin for applications that need to manage Markdown content as part of their application.

The feature will provide a configurable way to turn Markdown files into application content, including metadata, ordering, navigation, and rendering.

It will be designed as an add-on (`nutin-add markdown`) rather than a core Nutin feature, keeping Markdown-related functionality out of applications that do not need it.

*SEO support for Markdown content will be addressed separately.*
