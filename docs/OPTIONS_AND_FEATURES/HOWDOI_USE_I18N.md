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

## Optional: Enable locale generation

```js
// nutin.config.js
export default {
  generator: {
    generateLocales: true // Generate locale files alongside components and views
  }
}
```
