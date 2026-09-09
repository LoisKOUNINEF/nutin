# How do I remove empty elements?

Mark an element `data-optional`, and it's removed after render if it (or its interpolated value) ends up empty.

```html
<!-- Removed if myOptionalData is undefined -->
<div data-optional="${myOptionalData}">${myOptionalData}</div>
<div data-optional>${myOptionalData}</div>

<!-- Removed if its src ends up empty -->
<img data-optional src="${imageUrl}">
```

Two checks run on every `[data-optional]` element on each render; either one removes it. The `data-optional` attribute itself is always stripped from the element afterward, whether or not it was removed.

## Check 1 — the attribute's own value

Meant for direct interpolation (`data-optional="${x}"`):

- A **bare** `data-optional` (no value) does *not* trigger this check — it defers entirely to Check 2.
- A **present-but-blank** value (whitespace only) is removed — even if the element still has real content.
- The literal strings `"undefined"` or `"null"` (produced by interpolating an undefined/null expression) are removed.

## Check 2 — structural fallback by tag

Only relevant when Check 1 doesn't already force removal:

| Element | Empty when |
|---|---|
| `<img>` | `.src` is empty |
| `<input>` / `<textarea>` | `.value` is empty/whitespace |
| `<audio>` / `<video>` / `<source>` | the `src` **attribute** is missing (checked as an attribute, not the resolved property) |
| anything else | trimmed `textContent` is empty, or literally `"undefined"` or `"null"` |
