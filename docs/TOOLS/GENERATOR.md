# Generator

## Usage 

```bash
<pm> run generate TYPE PATH/TO/NAME
```

- `type` is a string (`component` || `view` || `service`).
- `path` is a target path where files will be created; the script normalizes / extracts the last word to derive the `name`. Files will be created in `TYPE_FOLDER/PATH/TO/NAME/NAME.ts` or in `TYPE_FOLDER/NAME/NAME.ts` if only `name` was provided.

## Files generated

- `<type>/<name>/<name>.<type>.ts`

Generator-produced components and views intentionally include the `__TEMPLATE_PLACEHOLDER__` token. This is by design: the build step `merge-templates.js` uses this token to inject HTML templates into those files.

- `<type>/<name>/<name>.<type>.html`

A template can also be written directly inline (remove the `.html` file and the `__TEMPLATE_PLACEHOLDER__` token). Defining both an inline template and an external `.html` file, or neither, fails the build.

- `<type>/<name>/<name>.<type>.scss`
- *If `i18n` is on* : `<type>/<name>/locales/*.json` - from `config/languages.json`'s `LANGUAGES`
- *If `testinNutin.includeApp` is on* : `<type>/<name>/<name>.<type>.test.js`
