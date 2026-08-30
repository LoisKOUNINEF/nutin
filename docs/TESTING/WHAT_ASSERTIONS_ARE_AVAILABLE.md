# What assertions are available?

`expect(actual)` returns a Jest/Chai-style matcher chain; every matcher
throws a descriptive `Error` on failure.

| Matcher | Checks |
|---|---|
| `.toBe(expected)` | strict equality (`===`) |
| `.toEqual(expected)` | recursive deep equality (arrays/plain objects) |
| `.toContain(substring)` | `actual.includes(substring)` (strings or arrays) |
| `.toBeTruthy()` / `.toBeFalsy()` | truthiness |
| `.toBeDefined()` | not `null`/`undefined` |
| `.toBeUndefined()` | `null` **or** `undefined` (passes for `null` too, despite the name) |
| `.toBeInstanceOf(ctor)` | `actual instanceof ctor` |
| `.toHaveBeenCalled()` | spy/mock handle has a non-empty `.calls` |
| `.toHaveBeenCalledWith(...args)` | deep-equal match against any recorded call |
| `.toBeLessThan(expected)` | fails only if `actual > expected` |
| `.toBeGreaterThan(expected)` | fails only if `actual < expected` |
| `.toThrow(expectedMessage?)` | `actual()` throws; if given, the error message must include `expectedMessage` |

`.not` is supported on every matcher above — it's built generically by
wrapping each one to invert pass/fail, e.g. `expect(x).not.toBe(y)`.

See [How do I spy on methods?](./HOWDOI_SPY_ON_METHODS.md).
