# How do I use pipes?

```html
<div data-pipe="capitalizeAll"></div>
<div data-pipe="date:fr-FR,long,time"></div>
<div data-pipe="date|capitalizeAll"></div>
<div data-pipe="date:en-US,long,time|capitalizeAll"></div>
<div data-pipe="capitalizeAll" data-pipe-source="raw text to capitalize"></div>
```

`data-pipe="pipeName[:arg1,arg2,...]"` pipes an element's value/text through one or more registered pipes, writing the result back — `.value` for `<input>`/`<textarea>`, `.textContent` for anything else.

- **Chaining**: separate pipe names with `|` — each runs left-to-right on the previous result.
- **Args**: after `:`, comma-separated, passed positionally to the pipe function.
- **`data-pipe-source`**: overrides what value feeds the pipe, instead of the element's own value/text. An *empty string* still counts as an explicit override (checked by presence, not truthiness).
- **Empty segment name**: a segment with no name (e.g. `data-pipe=":arg"`) logs a warning and is skipped — the rest of the chain still runs, the same as calling an unregistered pipe name (see [How do I create pipes?](./HOWDOI_CREATE_PIPES.md)).

See [What pipes are available?](./WHAT_PIPES_ARE_AVAILABLE.md) for the built-in list, and [How do I create pipes?](./HOWDOI_CREATE_PIPES.md) to register your own.

## Gotchas

- An empty `data-pipe` attribute is a no-op.
