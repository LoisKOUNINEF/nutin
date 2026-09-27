# Generator

## Usage 

```bash
<pm> run generate TYPE PATH/TO/NAME
```

- `type` is a string (`component` || `view` || `service`).
- `path` is a target path (relative to `src/app/`) where files will be created; the script normalizes / extracts the last word to derive the `name`. 
- You choose the structure — new projects suggest `components/`, `views/` and `services/`, but any layout works.

## Files generated

**Target directory:** `src/app/<path>/<to>/<name>/` or `src/app/<name>/` if only `name` was provided.

The generator stops without writing anything if the target directory already exists and isn't empty (folder names carry no type suffix, so a view and a component generated at the same path would otherwise share a folder). 

Generated elements are not re-exported from any barrel file: import them by their file path.

- Component class: `<name>.<type>.ts`

Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: this token is used on build to inject HTML templates into those files.

- HTML template: `<name>.<type>.html`

A template can also be written directly inline (remove the `.html` file and the `__TEMPLATE_PLACEHOLDER__` token). Defining both an inline template and an external `.html` file, or neither, fails the build.

- Stylesheet: `<name>.<type>.scss`
- *when `i18n` is on*: Locale files: `locales/*.json` - from `config/languages.json`'s `LANGUAGES`. For a view, each file is seeded with a top-level `title` key (used as a `document.title` fallback — see [How do I create a view?](../API/VIEWS_AND_ROUTING/HOWDOI_CREATE_A_VIEW.md)); component locale files don't get one.
- *when `testinNutin.includeApp` is on*: Test files: `<name>.<type>.test.js`
