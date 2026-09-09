# How do I use SEO file generation?

## Enable option

```js
// nutin.config.js
export default {
  generateSEOFiles: true,
}
```

`route.title` is also consumed at runtime: on every route change, `document.title` is set from the matching route's `title` here (falling back to the view's `viewName` when `generateSEOFiles` is off or no route matches) — see [How do I create a view?](../API/VIEWS_AND_ROUTING/HOWDOI_CREATE_A_VIEW.md).

## Configuration file

```json
// `config/seo.json` 
{
  "baseUrl": "https://my-nutin-app.eu",
  "disallowBots": [],
  "routes": [ /* ... */ ]
}
```

### Default example 

```json
{
  "baseUrl": "https://my-nutin-app.eu",
  "disallowBots": ["GPTBot"],
  "routes": [
    {
      "path": "/",
      "title": "My Nutin App — Home",
      "description": "Welcome to My Nutin App.",
      "ogImage": "/assets/images/og-cover.jpg"
    },
    {
      "path": "/blog/:slug",
      "title": "My Nutin App — Blog",
      "description": "Read the latest posts.",
      "mockParams": { "slug": "hello-world" },
      "mockFetch": { "/api/posts/hello-world": { "title": "Hello World", "body": "..." } }
    }
  ]
}
```

### With i18n option enabled

**See [How do I use i18n](HOWDOI_USE_I18N.md)** to help you enable i18n in your project.

```json
// With i18n enabled and, in this example, `config/languages.json` listing `en`+`fr`
{
  "baseUrl": "https://my-nutin-app.com",
  "disallowBots": [],
  "routes": [
    {
      "path": "/",
      "title": { "en": "My Nutin App — Home", "fr": "Mon App Nutin — Accueil" },
      "description": { "en": "Welcome to My Nutin App.", "fr": "Bienvenue sur Mon App Nutin." },
      "ogImage": "/assets/images/og-cover.jpg"
    },
    // Second route left flat - SEO file will be generated but not localized
    {
      "path": "/blog/:slug",
      "title": "My Nutin App — Blog",
      "description": "Read the latest posts.",
      "mockParams": { "slug": "hello-world" }
    }
  ]
}
```

`ogImage` stays flat even on the localized route.

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
