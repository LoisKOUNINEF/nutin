# How do I silence console output?

```js
silenceConsole('warn', () => registerPipes());
silenceConsole(['info', 'error'], () => runScript(scriptPath, message));
```

`silenceConsole(methodOrMethods, fn)` wraps a single call, spying on and
no-op'ing one or more `console` methods (a single name or an array) for the
duration of that call, then restoring them automatically — before returning
the call's result. Works for both sync and async `fn`: a thenable return
value is awaited before restoring, so the spies stay installed for the
whole async operation.

Use it for expected-but-noisy console output you don't need to assert
on — e.g. the real `console.warn` from calling `registerPipes()` when the
pipes are already registered (see `pipes.test.js`/
`pipe-registry.test.js`). 

If a test needs to assert *what* was logged (`.callCount`, `.lastCall`), use
`spyOn(console, 'method')` directly instead — `silenceConsole` doesn't
expose the underlying spy handle.

See [How do I mock core services?](./HOWDOI_MOCK_CORE_SERVICES.md).
