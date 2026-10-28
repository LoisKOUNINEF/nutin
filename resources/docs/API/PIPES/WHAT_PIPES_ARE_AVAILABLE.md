# What pipes are available?

Registered by `registerPipes()`, which must be called once at bootstrap (in `main.ts`, before the first render) — none of these names resolve until then.

`currency` and `date` default to the page's language: `<html lang>` (i18n sets it to the current language), or `en` when it's empty. An empty locale argument keeps that default (`date:,short`).

| Name | Signature | Behavior |
|---|---|---|
| `currency` | `(value, currency = 'USD', locale = page language)` | `Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value))` |
| `date` | `(value, locale = page language, format = 'long', time = false, pattern)` | Formats via `Intl`. `format` is `'short' \| 'long' \| 'numeric' \| 'time'`; an unrecognized value falls back to `'long'`. `numeric` gives the locale's numeric date (`10/28/2026` in `en-US`, `28/10/2026` in `fr-FR`), or follows `pattern` when given: `YYYY`, `YY`, `MM` and `DD` (zero-padded) in any order, with any separator (`DD/MM/YYYY`, `YYYY-MM-DD`, `DD.MM.YY`). When `time` is `true` (or the string `"true"`), hour/minute are appended to `short`/`long`/`numeric`. An invalid date logs a warning and returns the value unchanged. |
| `number` | `(value, decimals = 0)` | `Number(value).toFixed(decimals)` |
| `uppercase` | `(value)` | Uppercases the whole string |
| `lowercase` | `(value)` | Lowercases the whole string |
| `capitalize` | `(value)` | Uppercases the first character, lowercases the rest — `"HELLO world"` → `"Hello world"` |
| `capitalizeAll` | `(value)` | Capitalizes the first letter after start-of-string or a space/`.`/`,`/`"`/`'`, but not right after an apostrophe — `"o'brien's house"` → `"O'brien's House"` |
| `truncate` | `(value, length = 50, suffix = '...')` | Slices to `length` and appends `suffix` if longer; unchanged otherwise |
| `default` | `(value, defaultValue = '')` | Returns `value \|\| defaultValue` — any falsy value (`0`, `''`, `null`, `false`) triggers the default, not just `null`/`undefined` |
| `json` | `(value)` | `JSON.stringify(value, null, 2)`; falls back to `String(value)` if stringifying throws |

```html
<span data-pipe="date:en-US,short|uppercase">2024-03-15</span>
<input data-pipe="currency:EUR,de-DE" data-pipe-source="1000">
<time data-pipe="date:,numeric,false,DD/MM/YYYY">2024-03-15</time>  <!-- 15/03/2024 -->
```

See [How do I use pipes?](./HOWDOI_USE_PIPES.md) for the full `data-pipe` syntax.
