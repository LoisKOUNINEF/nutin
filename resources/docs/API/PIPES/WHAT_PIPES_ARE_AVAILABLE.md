# What pipes are available?

Registered by `registerPipes()`, which must be called once at bootstrap (in `main.ts`, before the first render) — none of these names resolve until then.

| Name | Signature | Behavior |
|---|---|---|
| `currency` | `(value, currency = 'USD', locale = 'en-US')` | `Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value))` |
| `date` | `(value, locale = navigator.language, format = 'long', time = false)` | Formats via `Intl`. `format` is `'short' \| 'long' \| 'time'`; an unrecognized value falls back to `'long'`. When `time` is truthy, hour/minute are appended to `short`/`long`. An invalid date logs a warning and returns the value unchanged. |
| `number` | `(value, decimals = 0)` | `Number(value).toFixed(decimals)` |
| `uppercase` | `(value)` | Uppercases the whole string |
| `lowercase` | `(value)` | Lowercases the whole string |
| `capitalize` | `(value)` | Uppercases the first character, lowercases the rest — `"HELLO world"` → `"Hello world"` |
| `capitalizeAll` | `(value)` | Capitalizes the first letter after start-of-string or a space/`.`/`,`/`"`/`'`, but not right after an apostrophe — `"o'brien's house"` → `"O'brien's House"` |
| `truncate` | `(value, length = 50, suffix = '...')` | Slices to `length` and appends `suffix` if longer; unchanged otherwise |
| `default` | `(value, defaultValue = '')` | Returns `value \|\| defaultValue` — any falsy value (`0`, `''`, `null`, `false`) triggers the default, not just `null`/`undefined` |
| `json` | `(value)` | `JSON.stringify(value, null, 2)`; falls back to `String(value)` if stringifying throws |

```html
<span data-pipe="date:short|uppercase">2024-03-15</span>
<input data-pipe="currency:EUR,de-DE" data-pipe-source="1000">
```

See [How do I use pipes?](./HOWDOI_USE_PIPES.md) for the full `data-pipe` syntax.
