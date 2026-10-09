# How do I use i18n?

## Enable option

```js
// nutin.config.js
export default {
  i18n: true,
}
```

## Configuration file

```json
// `config/languages.json` 
{
  "languages": [
    "en"
    // add / remove supported languages here
  ],
  "defaultLanguage": "en" // must match one entry in "languages"
}
```

## Usage

In HTML templates, use `data-i18n` attribute to register keys.

```json
// components/my-component/locales/en.json
{
  "my-key": "Hello, world."
}
```

```html
<div data-i18n="my-component.my-key"></div>
``` 

`data-i18n` will replace the element text content with the first value found
```
language value -> default language value -> text content -> raw key
```

A generated view's locale file also gets a top-level `title` key, consumed as a `document.title` fallback — see [How do I create a view?](../API/VIEWS_AND_ROUTING/HOWDOI_CREATE_A_VIEW.md).

Locales are keyed by their folder's name, so two folders with the same name in different places (e.g. `admin/user/` and `public/user/`) fail the build. Rename one.

## Links

Every page lives under its language prefix (`/en/docs/`). Write links without it: a root-relative `href` is prefixed with the current language when the component renders, with a trailing slash to match the page's canonical URL.

```html
<a href="/docs" data-event="click:navigateTo:@attr:href">Docs</a>
<!-- rendered: <a href="/en/docs/" …> -->
```

Prerendered SEO pages and copied links then point at the real page instead of an unlocalized duplicate. `navigateTo()` strips the prefix again, so the click works as before. External links, `//host` links, relative links, links that already start with a language, and files (a last segment with a `.`, e.g. `/files/guide.pdf`) are left as written. Link to a page of the same host that isn't part of the app with an absolute URL.

## Using translations in code

`main.ts` calls `await initI18n()` before the app starts: it loads the translations when `i18n` is enabled, and does nothing otherwise. With `i18n` off, the i18n code is left out of the bundle as long as your own code doesn't reference `I18nService`.

```ts
import { I18nService } from '../../../core/index.js';

const label = I18nService.translate('my-component.my-key');
await I18nService.setCurrentLanguage('fr');

const unsubscribe = I18nService.onLanguageChange(({ lang }) => console.log(lang));
unsubscribe(); // stops listening
```
