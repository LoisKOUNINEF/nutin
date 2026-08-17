# SEO

## Table of Contents

- [Overview](#overview)
- [config/seo.json](#configseojson)
- [Route fields](#route-fields)
- [Example: i18n disabled (default)](#example-i18n-disabled-default)
- [Example: i18n enabled](#example-i18n-enabled)
- [i18n content validation](#i18n-content-validation)
- [robots.txt](#robotstxt)
- [sitemap.xml](#sitemapxml)
- [Routes missing from seo.json](#routes-missing-from-seojson)
- [Build pipeline behavior](#build-pipeline-behavior)
- [Where to look in code](#where-to-look-in-code)

## Overview

SEO generation is a `build:prod`-only step (`NODE_ENV=production`), gated by
`nutin.config.js`'s `builder.generateSEO` (default `true`), driven entirely by
`config/seo.json` (plus `config/languages.json` when i18n is on). It produces per-route
(per-language, if i18n) static `index.html` files with real SSR-rendered content and meta
tags, plus `robots.txt` and `sitemap.xml`.

## config/seo.json

```json
{
  "baseUrl": "https://my-website.com",
  "disallowBots": [],
  "routes": [ /* ... */ ]
}
```

- `baseUrl` — origin used for canonical/OG URLs, sitemap `<loc>` entries, and the `Sitemap:`
  line in `robots.txt`; a trailing slash is stripped automatically.
- `disallowBots` — bot user-agent names that get a blanket `Disallow: /` in `robots.txt` even
  with no per-route rule.
- `routes` — array of route entries, one per app route you want SEO/SSR output for (see field
  reference below).

## Route fields

| Field | Required | Type | Notes |
|---|---|---|---|
| `path` | yes | `string` | Must match a key in `src/app/routes.ts`'s `appRoutes`; dynamic segments use `:param` (`:param?` for optional). |
| `title` | yes | `string \| { [lang]: string }` | A flat string applies to every language uniformly; use a per-language object to localize. |
| `description` | yes | `string \| { [lang]: string }` | Same rules as `title`. |
| `ogImage` | no | `string \| { [lang]: string }` | Only written into `og:image`/`twitter:image` when present — omit to leave those tags out entirely. |
| `mockParams` | required if `path` has dynamic segments | `{ [param]: string }` | One representative value per dynamic segment, used to SSR-render that route at build time; missing one is a build-time `exit(1)`. |
| `mockFetch` | no | `{ [url]: jsonBody }` | Exact-URL-keyed map — any `fetch(url)` call made while SSR-rendering this route that matches a key resolves to `jsonBody` instead of hitting the network. For views that fetch data on mount. |
| `disallow` | no | `true \| string[]` | `true` blocks this path for every bot in `robots.txt`; an array of bot names blocks it only for those bots. |

## Example: i18n disabled (default)

```json
{
  "baseUrl": "https://my-app.com",
  "disallowBots": ["GPTBot"],
  "routes": [
    {
      "path": "/",
      "title": "My App — Home",
      "description": "Welcome to My App.",
      "ogImage": "/assets/images/og-cover.jpg"
    },
    {
      "path": "/blog/:slug",
      "title": "My App — Blog",
      "description": "Read the latest posts.",
      "mockParams": { "slug": "hello-world" },
      "mockFetch": { "/api/posts/hello-world": { "title": "Hello World", "body": "..." } }
    },
    {
      "path": "/admin",
      "title": "My App — Admin",
      "description": "Internal admin area.",
      "disallow": true
    }
  ]
}
```

Flat `title`/`description` here isn't a mistake — this is exactly the default scaffold shape
(`config/seo.json.hbs`), and it's what the non-i18n resolution path expects: a flat value is
used as-is for every request.

## Example: i18n enabled

Same app, `nutin.config.js`'s `i18n: true`, `config/languages.json` listing `en`+`fr`. One
route is fully localized; the other is left flat on purpose:

```json
{
  "baseUrl": "https://my-app.com",
  "disallowBots": [],
  "routes": [
    {
      "path": "/",
      "title": { "en": "My App — Home", "fr": "Mon App — Accueil" },
      "description": { "en": "Welcome to My App.", "fr": "Bienvenue sur Mon App." },
      "ogImage": "/assets/images/og-cover.jpg"
    },
    {
      "path": "/blog/:slug",
      "title": "My App — Blog",
      "description": "Read the latest posts.",
      "mockParams": { "slug": "hello-world" }
    }
  ]
}
```

`ogImage` stays flat even on the localized route — that's fine, it's optional and often shared
across languages on purpose. `/blog/:slug` stays entirely flat too — also fine, but see the
next section for what that triggers.

## i18n content validation

When i18n is on, an upfront pass runs over every route × language × field (`title`,
`description`) before the SSR bundle is even built, with three possible outcomes:

1. **No language values** (warning, non-fatal) — a field is a flat value: the same content is
   used for every language. This is just a nudge that the route hasn't been localized yet, not
   an error — flat values are fully supported by design.
2. **Fallback used** (warning, non-fatal) — a field is a per-language object missing one
   language's key. That language's page falls back to `defaultLanguage`'s value (or the first
   available one if `defaultLanguage` itself is missing), and the warning names which language
   it fell back to.
3. **Missing entirely** (error, `exit(1)`) — a field has no resolvable value in *any* language.
   This is a hard build failure — same requirement as the non-i18n path, which also requires a
   truthy `title`/`description`, just without the fallback/warning tiers (it fails immediately
   if either is falsy).

## robots.txt

- `User-agent: *` block with `Allow: /`, plus `Disallow: <path>` for every route with
  `disallow: true`.
- One `User-agent: <bot>` block per bot named in a route's `disallow: [...]` array or in the
  top-level `disallowBots` list — a bot with no path-specific entries gets a blanket
  `Disallow: /`.
- Always ends with `Sitemap: <baseUrl>/sitemap.xml`.

## sitemap.xml

One `<url><loc>` entry per route (trailing slash always added). When i18n is on, one entry per
route **per configured language** instead (`<baseUrl>/<lang><path>/`).

## Routes missing from seo.json

The builder diffs the real `appRoutes` keys (from `src/app/routes.ts`, via the SSR bundle)
against `seo.json`'s routes. Any real route with no matching entry gets a warning urging you to
add one — except `/404`, `/403`, `/500`, which get a quieter "probably intentional" note
instead. Never fatal.

## Build pipeline behavior

- Only runs on `<pm> run build:prod` (`NODE_ENV=production`), and only if `nutin.config.js`'s
  `builder.generateSEO` is `true` (default `true`).
- Runs after `compress-files.js`, before `finalize-build.js`.
- `generate-seo-files.js` orchestrates, in order:
  1. HTML generation — per-route/lang static `index.html` with real SSR content and meta tags.
  2. `robots.txt` generation.
  3. `sitemap.xml` generation.
- Output lands in `dist-build/src/` (renamed to `dist/src/` by `finalize-build.js`), with
  per-language subfolders (`dist/src/<lang>/...`) when i18n is on.
- Any hard failure here (missing `mockParams`, the i18n "missing" tier above, or an unexpected
  error) exits the whole build with code 1.

## Where to look in code

All paths below are relative to a generated app's project root (template source under
`packages/nutin/templates/base/` in the nutin repo itself):

- `config/seo.json` — see [Example: i18n disabled](#example-i18n-disabled-default) /
  [Example: i18n enabled](#example-i18n-enabled) above for the default scaffold shape.
- `config/languages.json` — `languages`/`defaultLanguage`; see also [CORE.md](CORE.md) for
  `I18nService`'s runtime API.
- `tools/builder/core/seo/generate-seo-html.js` — HTML generation, the i18n validation tiers,
  tag injection (`applySubstitutions`/`upsertInHead`).
- `tools/builder/core/seo/generate-robots-txt.js`, `generate-sitemap-xml.js`.
- `tools/builder/core/generate-seo-files.js` — orchestrator.
- `tools/builder/core/seo/ssr/` — `ssr-bundle.js`, `ssr-render.js`, `ssr-polyfills.js`
  (`mockFetch` resolution, DOM/global polyfills for linkedom).
- `tools/builder/builder.js` — pipeline step order/gating.
