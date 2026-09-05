# Generator

## Usage 

```bash
<pm> run generate TYPE NAME
<pm> run generate TYPE PATH/TO/NAME
```

- `type` is a string (`component` || `view` || `service`).
- `path` is a target path where files will be created; the script normalizes / extracts the last word to derive the `name`. 

## Files generated

**Target directory:** `<type>/<path>/<to>/<name>/` or `<type>/<name>/` if only `name` was provided.

- Component class: `<name>.<type>.ts`

Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: this token is used on build to inject HTML templates into those files.

- HTML template: `<name>.<type>.html`

A template can also be written directly inline (remove the `.html` file and the `__TEMPLATE_PLACEHOLDER__` token). Defining both an inline template and an external `.html` file, or neither, fails the build.

- Stylesheet: `<name>.<type>.scss`
- *when `i18n` is on*: Locale files: `locales/*.json` - from `config/languages.json`'s `LANGUAGES`. For a view, each file is seeded with a top-level `title` key (used as a `document.title` fallback — see [How do I create a view?](../API/VIEWS_AND_ROUTING/HOWDOI_CREATE_A_VIEW.md)); component locale files don't get one.
- *when `testinNutin.includeApp` is on*: Test files: `<name>.<type>.test.js`
