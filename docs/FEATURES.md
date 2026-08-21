# Nutin - Features documentation

## Table of Contents

- [SEO files generation](#seo-files-generation)
- [Docker](#docker)

## SEO files generation

`config/seo.json` - enabled in `nutin.config.js.generateSEO`.

```json
{
  "baseUrl": "https://my-website.com",
  "disallowBots": [],
  "routes": [ /* ... */ ]
}
```

### Route fields

| Field | Required | Type | Notes |
|---|---|---|---|
| `path` | yes | `string` | Must match a key in `src/app/routes.ts`'s `appRoutes`; dynamic segments use `:param` (`:param?` for optional). |
| `title` | yes | `string \| { [lang]: string }` | A flat string applies to every language uniformly; use a per-language object to localize. |
| `description` | yes | `string \| { [lang]: string }` | Same rules as `title`. |
| `ogImage` | no | `string \| { [lang]: string }` | Only written into `og:image`/`twitter:image` when present — omit to leave those tags out entirely. |
| `mockParams` | required if `path` has dynamic segments | `{ [param]: string }` | One representative value per dynamic segment, used to SSR-render that route at build time; missing one is a build-time `exit(1)`. |
| `mockFetch` | no | `{ [url]: jsonBody }` | Exact-URL-keyed map — any `fetch(url)` call made while SSR-rendering this route that matches a key resolves to `jsonBody` instead of hitting the network. For views that fetch data on mount. |
| `disallow` | no | `true \| string[]` | `true` blocks this path for every bot in `robots.txt`; an array of bot names blocks it only for those bots. |

### Examples

- Default (i18n disabled)

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
    }
  ]
}
```

- i18n enabled

`nutin.config.js`'s `i18n: true`, `config/languages.json` listing `en`+`fr`. One
route is fully localized; the other is left flat on purpose - will trigger a warning

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

`ogImage` stays flat even on the localized route.

## Docker

**IMPORTANT NOTE: Adapt port(s) as needed** 

- Default port: 

`9090`

- Dockerfile 

`ARG PORT=####`

- nginx.conf 

```nginx
server {
    # ---------------------------
    # LISTEN PORTS
    # ---------------------------
    listen ####;
``` 

### Dockerfile

A preconfigured, multi-stage Dockerfile that:

- Builds your application in a Node environment 
- Builds a brotli-enabled Nginx image:
```
FROM alpine
RUN apk add --no-cache nginx nginx-mod-http-brotli
```
- Serves the final assets
- Includes an optional container healthcheck
- Exposes ports for reverse proxies like Traefik
- Works out of the box with npm, yarn, pnpm, and bun — `nutin-add docker` detects your package manager and renders the matching install/lockfile lines.

### Compression

Gzip (`.gz`) and Brotli (`.br`) compression are handled by Nutin's builder (`tools/builder/core/prod-bundle/compress-files.js`).

Params:
```js
gzip: {
  level: 9,
  memLevel: 9,
  windowBits: 15
}

brotli: {
  [constants.BROTLI_PARAM_QUALITY]: 11,
  [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_GENERIC,
  [constants.BROTLI_PARAM_SIZE_HINT]: content.length
}
```

### Nginx Config

**This Nginx config assumes the use of a reverse proxy** (i.e. Traefik), so it:
- uses non-standard port(s) (default: 9090).
- does not include `add_header Strict-Transport-Security  "max-age=63072000" always;`. Add it here only if Nginx is exposed directly over HTTPS.

#### Gzip

Gzip is globally enabled.

```
gzip on # enables gzip compression for responses
gzip_static on # serves .gz files if present
gzip_proxied any # makes gzip work through a proxy
```

*Note: you can enable / disable gzip_static only for specific locations in nginx.conf if you don't want it to be enabled globally.*

#### Brotli compression

Brotli is globally enabled.

```
brotli on; # compresses anything not precompressed
brotli_static on; # serves .br files if present
```

#### Headers

*Reminder: when you use `add_header` in a child location block, it replaces ALL headers from the parent context rather than merging them.*
- You need to repeat the security headers in each location block that uses add_header. 
- This config uses nginx `map` directives to define headers once, then reuse them.

